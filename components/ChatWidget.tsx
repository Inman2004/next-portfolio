"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Send, Loader2 } from "lucide-react";
import { getTechColor } from "@/components/skillColors";
import { usePathname } from "next/navigation";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const initialAssistantMsg =
  `Hi! I'm Mimir. Ask about skills, projects, experience, education, or contact.`;

export default function ChatWidget() {
  const pathname = usePathname();
  const isVisible = pathname === "/";
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: initialAssistantMsg },
  ]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  // Compact assistant responses by default to avoid unnecessary long text
  const compactForDisplay = useCallback((text: string) => {
    if (!text) return text;
    let t = text
      // Remove filler/CTA lines that don't add info
      .split(/\r?\n/)
      .filter((line) => !/^(let me know|feel free to|i'd love to|ask me|do you want)/i.test(line.trim()))
      .join('\n');
    // Collapse extra blank lines
    t = t.replace(/\n{3,}/g, '\n\n');
    // Limit number of lines in collapsed view
    const lines = t.split(/\r?\n/);
    const maxLines = 18;
    if (lines.length > maxLines) {
      return lines.slice(0, maxLines).join('\n').trim();
    }
    // Also guard by characters as a fallback
    const maxChars = 1400;
    if (t.length > maxChars) {
      return t.slice(0, maxChars).replace(/\s+\S*$/, '').trim();
    }
    return t;
  }, []);

  // Subtle animation variants for assistant text
  const containerVariants = {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.02, ease: [0.16, 1, 0.3, 1] }
    }
  } as const;
  const itemVariants = {
    hidden: { opacity: 0, y: 2 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2 } }
  } as const;

  const containerRef = useRef<HTMLDivElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (open) scrollToBottom();
  }, [open, messages, scrollToBottom]);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canSend) return;

    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Send limited history to control token usage
          messages: messages
            .slice(-10)
            .concat(userMsg)
            .map((m) => ({ role: m.role, content: m.content })),
          // Optional: you can pass a system prompt here if needed
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = (await res.json()) as { reply: string };
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't reach the chat service just now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Minimal Markdown renderer for assistant messages (bold, italics, links, bullet lists)
  function renderInline(text: string, keyPrefix: string) {
    const parts: React.ReactNode[] = [];
    let rest = text;
    let idx = 0;
    const linkRe = /\[([^\]]+)\]\((https?:[^)\s]+)\)/;
    const boldRe = /\*\*([^*]+)\*\*/;
    const italicRe = /\*([^*]+)\*/;

    function nextMatch() {
      const linkM = rest.match(linkRe);
      const boldM = rest.match(boldRe);
      const italM = rest.match(italicRe);
      const candidates = [
        linkM ? { m: linkM, type: "link", i: linkM.index ?? -1 } : null,
        boldM ? { m: boldM, type: "bold", i: boldM.index ?? -1 } : null,
        italM ? { m: italM, type: "italic", i: italM.index ?? -1 } : null,
      ].filter(Boolean) as { m: RegExpMatchArray; type: string; i: number }[];
      if (!candidates.length) return null;
      candidates.sort((a, b) => a.i - b.i);
      return candidates[0];
    }

    while (rest.length) {
      const nm = nextMatch();
      if (!nm || nm.i < 0) {
        parts.push(rest);
        break;
      }
      if (nm.i > 0) {
        parts.push(rest.slice(0, nm.i));
        rest = rest.slice(nm.i);
      }
      const [full, g1, g2] = nm.m;
      if (nm.type === "link") {
        const text = g1;
        const href = g2 as string;
        parts.push(
          <a key={`${keyPrefix}-lnk-${idx++}`} href={href} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 dark:text-blue-400">{text}</a>
        );
      } else if (nm.type === "bold") {
        parts.push(
          <strong
            key={`${keyPrefix}-b-${idx++}`}
            className="text-blue-700 dark:text-blue-300"
          >
            {g1}
          </strong>
        );
      } else if (nm.type === "italic") {
        parts.push(<em key={`${keyPrefix}-i-${idx++}`}>{g1}</em>);
      }
      rest = rest.slice(full.length);
    }
    return parts;
  }

  function renderMarkdown(md: string) {
    const lines = md.split(/\r?\n/);
    const blocks: React.ReactNode[] = [];
    let listBuf: string[] = [];
    let currentSection = '';
    let inSkillsSection = false;

    function renderSkillBadges(skillsCsv: string) {
      const items = skillsCsv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      return (
        <span className="inline-flex flex-wrap gap-2 align-middle ml-1">
          {items.map((skill, i) => {
            // Avoid badging contact/links accidentally
            if (/(@|mailto:|tel:|https?:)/i.test(skill)) {
              return <span key={`skl-${i}`}>{skill}</span>;
            }
            const { bg, text, border } = getTechColor(skill);
            return (
              <span
                key={`skl-${i}`}
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${bg} ${text} ${border}`}
                title={skill}
              >
                {skill}
              </span>
            );
          })}
        </span>
      );
    }

    function flushList() {
      if (listBuf.length) {
        blocks.push(
          <motion.ul key={`ul-${blocks.length}`} className="list-disc ml-4 space-y-0.5" variants={containerVariants} initial="hidden" animate="show">
            {listBuf.map((li, i) => {
              // If line is like "Category: a, b, c" (common in Skills), render badges for RHS
              const m = li.match(/^([^:]+):\s*(.+)$/);
              if (m && inSkillsSection) {
                const label = m[1];
                const rest = m[2];
                return (
                  <motion.li key={`li-${i}`} variants={itemVariants}>
                    <span className="font-medium">{renderInline(label + ":", `li-l-${i}`)}</span>
                    {renderSkillBadges(rest)}
                  </motion.li>
                );
              }
              return <motion.li key={`li-${i}`} variants={itemVariants}>{renderInline(li, `li-${i}`)}</motion.li>;
            })}
          </motion.ul>
        );
        listBuf = [];
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // ATX headings (# .. ######)
      const hMatch = line.match(/^\s{0,3}(#{1,6})\s+(.*)$/);
      if (hMatch) {
        flushList();
        const level = Math.min(6, hMatch[1].length);
        const content = hMatch[2];
        currentSection = content.trim();
        inSkillsSection = /skill|technical\s+expertise/i.test(currentSection);
        const HeadingTag = (`h${level}` as keyof JSX.IntrinsicElements);
        const MotionHeading: any = motion[HeadingTag as unknown as keyof typeof motion] || motion.h3;
        blocks.push(
          <MotionHeading key={`h-${blocks.length}`} className="font-semibold text-foreground" variants={itemVariants} initial="hidden" animate="show">{renderInline(content, `h-${i}`)}</MotionHeading>
        );
        continue;
      }

      // Bulleted lists: -, *, •
      const liMatch = line.match(/^\s*([-*•])\s+(.*)$/);
      if (liMatch) {
        listBuf.push(liMatch[2]);
        continue;
      }
      if (line.trim() === "") {
        flushList();
        continue;
      }
      flushList();
      blocks.push(
        <motion.p key={`p-${blocks.length}`} className="leading-snug text-[13px]" variants={itemVariants} initial="hidden" animate="show">{renderInline(line, `p-${i}`)}</motion.p>
      );
    }
    flushList();
    return <motion.div className="space-y-2" variants={containerVariants} initial="hidden" animate="show">{blocks}</motion.div>;
  }

  // Close when clicking outside
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!open) return;
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  if (!isVisible) return null;

  return (
    <>
      {/* Toggle button */}
      <button
        aria-label={open ? "Close chat" : "Open chat"}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={containerRef}
            key="chat-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-5 z-40 flex h-[70vh] w-[min(92vw,380px)] flex-col overflow-hidden rounded-xl border border-gray-200 bg-zinc-100/60 shadow-2xl dark:border-gray-800 dark:bg-gray-900/60 backdrop-blur-lg"
            role="dialog"
            aria-label="Chat assistant"
          >
            <div className="flex items-center justify-between border-b border-gray-200 p-3 dark:border-gray-800">
              <div className="text-sm font-semibold">Mimir</div>
              <button
                onClick={() => setOpen(false)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto p-3">
              {messages.map((m, i) => {
                const isAssistant = m.role === "assistant";
                const isLong = isAssistant && (m.content?.length || 0) > 600;
                const isExpanded = !!expanded[i];
                return (
                  <div key={i} className="flex">
                    <div
                      className={
                        m.role === "user"
                          ? "ml-auto max-w-[80%] whitespace-pre-wrap rounded-lg bg-blue-600 px-3 py-2 text-sm text-white"
                          : "mr-auto max-w-[80%] whitespace-pre-wrap rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                      }
                    >
                      <div className={(!isExpanded && isLong) ? "relative max-h-56 overflow-hidden" : undefined}>
                        {isAssistant ? (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                            {renderMarkdown(isExpanded ? m.content : compactForDisplay(m.content))}
                          </motion.div>
                        ) : m.content}
                        {(!isExpanded && isLong) && (
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-gray-100 to-transparent dark:from-gray-800" />
                        )}
                      </div>
                      {isLong && (
                        <div className="mt-1 flex justify-end">
                          <button
                            type="button"
                            className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                            onClick={() => setExpanded(prev => ({ ...prev, [i]: !prev[i] }))}
                          >
                            {isExpanded ? "Show less" : "Show more"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {loading && (
                <div className="flex">
                  <div className="mr-auto inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={listEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="border-t border-gray-200 p-2 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      sendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 rounded-md border border-gray-300 bg-white/90 px-3 py-2 text-sm outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-100 dark:focus:border-blue-500 backdrop-blur-xl"
                />
                <button
                  type="submit"
                  disabled={!canSend}
                  className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  Send
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
