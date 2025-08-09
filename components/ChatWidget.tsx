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
  `Hi! I'm Immanuvel's assistant Mimir. Ask me anything about projects, skills, experience, education, or any quick answers.`;

export default function ChatWidget() {
  const pathname = usePathname();
  if (pathname !== "/") return null;
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: initialAssistantMsg },
  ]);

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
          <ul key={`ul-${blocks.length}`} className="list-disc ml-5 space-y-1">
            {listBuf.map((li, i) => {
              // If line is like "Category: a, b, c" (common in Skills), render badges for RHS
              const m = li.match(/^([^:]+):\s*(.+)$/);
              if (m) {
                const label = m[1];
                const rest = m[2];
                return (
                  <li key={`li-${i}`}>
                    <span className="font-medium">{renderInline(label + ":", `li-l-${i}`)}</span>
                    {renderSkillBadges(rest)}
                  </li>
                );
              }
              return <li key={`li-${i}`}>{renderInline(li, `li-${i}`)}</li>;
            })}
          </ul>
        );
        listBuf = [];
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const liMatch = line.match(/^\s*[-*]\s+(.*)$/);
      if (liMatch) {
        listBuf.push(liMatch[1]);
        continue;
      }
      if (line.trim() === "") {
        flushList();
        continue;
      }
      flushList();
      blocks.push(
        <p key={`p-${blocks.length}`} className="leading-relaxed">{renderInline(line, `p-${i}`)}</p>
      );
    }
    flushList();
    return <div className="space-y-2">{blocks}</div>;
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
            className="fixed bottom-20 right-5 z-40 flex h-[60vh] w-[min(92vw,360px)] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
            role="dialog"
            aria-label="Chat assistant"
          >
            <div className="flex items-center justify-between border-b border-gray-200 p-3 dark:border-gray-800">
              <div className="text-sm font-semibold">Mimir Assistant</div>
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
              {messages.map((m, i) => (
                <div key={i} className="flex">
                  <div
                    className={
                      m.role === "user"
                        ? "ml-auto max-w-[80%] whitespace-pre-wrap rounded-lg bg-blue-600 px-3 py-2 text-sm text-white"
                        : "mr-auto max-w-[80%] whitespace-pre-wrap rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                    }
                  >
                    {m.role === "assistant" ? renderMarkdown(m.content) : m.content}
                  </div>
                </div>
              ))}
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
                  className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-500"
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
