"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion as m, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Expand } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import ChatInterface from "./ChatInterface";

export default function ChatWidget() {
  const pathname = usePathname();
  const isVisible = pathname === "/";
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (open && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  if (!isVisible) return null;

  return (
    <>
      <button
        aria-label={open ? "Close chat" : "Open chat"}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      <AnimatePresence>
        {open && (
          <m.div
            ref={containerRef}
            key="chat-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-5 z-50 h-[70vh] w-[min(92vw,380px)] flex flex-col overflow-hidden rounded-xl bg-white/90 shadow-2xl dark:bg-zinc-900/90 backdrop-blur-lg border border-zinc-200/70 dark:border-zinc-800/70"
            role="dialog"
            aria-label="Chat assistant"
          >
            <div className="flex items-center justify-between border-b border-zinc-200/70 p-3 dark:border-zinc-800/70 bg-white/70 dark:bg-zinc-900/70">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Mimir</div>
              <div className="flex items-center gap-2">
                <Link href="/chat" passHref>
                  <a className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-100 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400/50" aria-label="Fullscreen">
                    <Expand className="h-4 w-4" />
                  </a>
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-100 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400/50"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <ChatInterface />
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
