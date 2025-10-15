"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion as m, AnimatePresence,  } from "framer-motion";
import { X, MessageCircle, Send, Loader2, Mic, MicOff, Volume2, VolumeX, Square } from "lucide-react";
import { getTechColor } from "@/components/skillColors";
import { usePathname } from "next/navigation";
import ElectricBorder from "./ElectricBorder";
import ShinyText from "./ShinyText";
import { useChat } from "@/contexts/ChatContext";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const initialAssistantMsg =
  "Greetings. I am Mimir, an AI assistant created by Immanuvel to share knowledge about his work. Like my namesake from the ancient tales, I draw from a well of information. Ask me about Immanuvel's skills, projects, or experience.";

export default function ChatInterface() {
  const { messages, input, loading, listening, ttsEnabled, setInput, sendMessage, startListening, stopListening, setTtsEnabled } = useChat();
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  // Strip most Markdown/formatting for voice playback
  const sanitizeForTTS = useCallback((md: string): string => {
    let t = md || '';
    // Remove code fences
    t = t.replace(/```[\s\S]*?```/g, '');
    // Remove inline code backticks
    t = t.replace(/`([^`]+)`/g, '$1');
    // Images -> alt text
    t = t.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '$1');
    // Links -> link text
    t = t.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
    // Bold/italic markers
    t = t.replace(/\*\*([^*]+)\*\*/g, '$1');
    t = t.replace(/\*([^*]+)\*/g, '$1');
    t = t.replace(/__([^_]+)__/g, '$1');
    t = t.replace(/_([^_]+)_/g, '$1');
    // Headings: remove #'s, keep text
    t = t.replace(/^\s{0,3}#{1,6}\s+/gm, '');
    // Blockquotes
    t = t.replace(/^\s*>\s?/gm, '');
    // Lists: remove bullets but keep lines
    t = t.replace(/^\s*[-*•]\s+/gm, '');
    // Horizontal rules
    t = t.replace(/^\s*(?:-{3,}|_{3,}|\*{3,})\s*$/gm, '');
    // Tables: strip pipes and separator rows
    t = t.replace(/^\s*\|/gm, '');
    t = t.replace(/\|/g, ' ');
    t = t.replace(/^\s*:?[-=]{2,}:?\s*(\|\s*:?[-=]{2,}:?\s*)*$/gm, '');
    // HTML tags
    t = t.replace(/<[^>]+>/g, '');
    // Collapse whitespace
    t = t.replace(/\s+\n/g, '\n');
    t = t.replace(/\n{3,}/g, '\n\n');
    t = t.replace(/[ \t]{2,}/g, ' ');
    return t.trim();
  }, []);

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
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    await sendMessage();
  };

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
          <m.ul key={`ul-${blocks.length}`} className="list-disc ml-4 space-y-0.5" variants={containerVariants} initial="hidden" animate="show">
            {listBuf.map((li, i) => {
              // If line is like "Category: a, b, c" (common in Skills), render badges for RHS
              const match = li.match(/^([^:]+):\s*(.+)$/);
              if (match && inSkillsSection) {
                const label = match[1];
                const rest = match[2];
                return (
                  <m.li key={`li-${i}`} variants={itemVariants}>
                    <span className="font-medium">{renderInline(label + ":", `li-l-${i}`)}</span>
                    {renderSkillBadges(rest)}
                  </m.li>
                );
              }
              return <m.li key={`li-${i}`} variants={itemVariants}>{renderInline(li, `li-${i}`)}</m.li>;
            })}
          </m.ul>
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
        const MotionHeading: any = (m as any)[HeadingTag] || (m as any).h3;
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
        <m.p key={`p-${blocks.length}`} className="leading-snug text-[13px]" variants={itemVariants} initial="hidden" animate="show">{renderInline(line, `p-${i}`)}</m.p>
      );
    }
    flushList();
    return <m.div className="space-y-2" variants={containerVariants} initial="hidden" animate="show">{blocks}</m.div>;
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {/* Listening indicator */}
        {listening && (
          <div className="flex">
            <div className="mr-auto inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/30 dark:text-red-300">
              <Mic className="h-3.5 w-3.5" /> Listening...
            </div>
          </div>
        )}
        {messages.map((msg, i) => {
          const isAssistant = msg.role === "assistant";
          const isLong = isAssistant && (msg.content?.length || 0) > 600;
          const isExpanded = !!expanded[i];
          return (
            <div key={i} className="flex">
              <div
                className={
                  msg.role === "user"
                    ? "ml-auto max-w-[80%] whitespace-pre-wrap rounded-lg bg-blue-600 px-3 py-2 text-sm text-white"
                    : "mr-auto max-w-[80%] whitespace-pre-wrap rounded-lg bg-zinc-100 px-3 py-1.5 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                }
              >
                <div className={(!isExpanded && isLong) ? "relative max-h-56 overflow-hidden" : undefined}>
                  {isAssistant ? (
                    <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                      {renderMarkdown(isExpanded ? msg.content : compactForDisplay(msg.content))}
                    </m.div>
                  ) : msg.content}
                  {(!isExpanded && isLong) && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-zinc-100 to-transparent dark:from-zinc-800" />
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
            <div className="mr-auto inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              <Loader2 className="h-4 w-4 animate-spin" />
              <ShinyText speed={1} disabled={false} text="Thinking..." />
            </div>
          </div>
        )}
        <div ref={listEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-zinc-200 p-2 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleSendMessage();
              }
            }}
            placeholder="Type your message..."
            className="flex-1 rounded-md border border-zinc-300 bg-white/90 px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-100 dark:focus:border-blue-500 backdrop-blur-xl"
          />
          {/* Mic button */}
          <button
            type="button"
            onClick={() => (listening ? stopListening() : startListening())}
            className={`inline-flex items-center justify-center rounded-md border px-2.5 py-2 text-sm font-medium shadow-sm transition-colors ${
              listening
                ? 'border-red-300 bg-red-100 text-red-700 hover:bg-red-200 dark:border-red-600/50 dark:bg-red-900/30 dark:text-red-300'
                : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200'
            }`}
            title={listening ? 'Stop voice input' : 'Start voice input'}
            aria-label={listening ? 'Stop voice input' : 'Start voice input'}
          >
            {listening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
          {/* TTS toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !ttsEnabled;
              setTtsEnabled(next);
              try { window.localStorage.setItem('chat_tts_enabled', next ? '1' : '0'); } catch {}
              if (!next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                try { window.speechSynthesis.cancel(); } catch {}
              }
            }}
            className="inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-2.5 py-2 text-sm text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            title={ttsEnabled ? 'Disable voice playback' : 'Enable voice playback'}
            aria-label={ttsEnabled ? 'Disable voice playback' : 'Enable voice playback'}
          >
            {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
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
    </div>
  );
}
