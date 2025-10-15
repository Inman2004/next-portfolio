"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatContextType = {
  messages: ChatMessage[];
  input: string;
  loading: boolean;
  listening: boolean;
  ttsEnabled: boolean;
  setInput: (input: string) => void;
  sendMessage: () => Promise<void>;
  startListening: () => void;
  stopListening: () => void;
  setTtsEnabled: (enabled: boolean) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

const initialAssistantMsg =
  "Greetings. I am Mimir, an AI assistant created by Immanuvel to share knowledge about his work. Like my namesake from the ancient tales, I draw from a well of information. Ask me about Immanuvel's skills, projects, or experience.";

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: initialAssistantMsg },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [listening, setListening] = useState(false);
  const [ttsEnabled, setTtsEnabledState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = window.localStorage.getItem('chat_tts_enabled');
      return saved ? saved === '1' : false;
    } catch { return false; }
  });
  const recognitionRef = useRef<any>(null);
  const sttBaseRef = useRef<string>("");
  const sttInterimRef = useRef<string>("");

  const sanitizeForTTS = useCallback((md: string): string => {
    let t = md || '';
    t = t.replace(/```[\s\S]*?```/g, '');
    t = t.replace(/`([^`]+)`/g, '$1');
    t = t.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '$1');
    t = t.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
    t = t.replace(/\*\*([^*]+)\*\*/g, '$1');
    t = t.replace(/\*([^*]+)\*/g, '$1');
    t = t.replace(/__([^_]+)__/g, '$1');
    t = t.replace(/_([^_]+)_/g, '$1');
    t = t.replace(/^\s{0,3}#{1,6}\s+/gm, '');
    t = t.replace(/^\s*>\s?/gm, '');
    t = t.replace(/^\s*[-*•]\s+/gm, '');
    t = t.replace(/^\s*(?:-{3,}|_{3,}|\*{3,})\s*$/gm, '');
    t = t.replace(/^\s*\|/gm, '');
    t = t.replace(/\|/g, ' ');
    t = t.replace(/^\s*:?[-=]{2,}:?\s*(\|\s*:?[-=]{2,}:?\s*)*$/gm, '');
    t = t.replace(/<[^>]+>/g, '');
    t = t.replace(/\s+\n/g, '\n');
    t = t.replace(/\n{3,}/g, '\n\n');
    t = t.replace(/[ \t]{2,}/g, ' ');
    return t.trim();
  }, []);

  useEffect(() => {
    const SR: any = (typeof window !== 'undefined') && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    if (!SR) return;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onresult = (event: any) => {
      let interim = '';
      let finalChunk = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalChunk += transcript;
        } else {
          interim += transcript;
        }
      }
      if (interim) {
        sttInterimRef.current = interim.trim();
        const composed = `${sttBaseRef.current} ${sttInterimRef.current}`.trim();
        setInput(composed);
      }
      if (finalChunk) {
        sttBaseRef.current = `${sttBaseRef.current} ${finalChunk}`.trim();
        sttInterimRef.current = '';
        setInput(sttBaseRef.current);
      }
    };
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    return () => {
      try { rec.abort(); } catch {}
      recognitionRef.current = null;
    };
  }, []);

  const startListening = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    sttBaseRef.current = (typeof input === 'string' ? input : '').trim();
    sttInterimRef.current = '';
    try { rec.start(); } catch {}
  }, [input]);

  const stopListening = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    try { rec.stop(); } catch {}
  }, []);

  const setTtsEnabled = useCallback((enabled: boolean) => {
    setTtsEnabledState(enabled);
    try {
      window.localStorage.setItem('chat_tts_enabled', enabled ? '1' : '0');
      if (!enabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!ttsEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'assistant' || !last.content) return;
    try {
      window.speechSynthesis.cancel();
      const cleaned = sanitizeForTTS(last.content);
      if (!cleaned) return;
      const utter = new SpeechSynthesisUtterance(cleaned);
      utter.rate = 1;
      utter.pitch = 1;
      utter.volume = 1;
      window.speechSynthesis.speak(utter);
    } catch {}
  }, [messages, ttsEnabled, sanitizeForTTS]);

  useEffect(() => {
    try {
      const key = "chat_session_id";
      let sid: string | null = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
      if (!sid) {
        const gen: string = (typeof crypto !== "undefined" && (crypto as any).randomUUID)
          ? (crypto as any).randomUUID()
          : `sid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
        sid = gen;
        if (typeof window !== "undefined" && sid) window.localStorage.setItem(key, sid);
      }
      if (sid) setSessionId(sid);
      else setSessionId(`sid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`);
    } catch {
      setSessionId(`sid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`);
    }
  }, []);

  const sendMessage = async () => {
    if (input.trim().length === 0 || loading) return;

    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.slice(-10).concat(userMsg).map((m) => ({ role: m.role, content: m.content })),
          sessionId,
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
          content: "Sorry, I couldn't reach the chat service just now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChatContext.Provider value={{ messages, input, loading, listening, ttsEnabled, setInput, sendMessage, startListening, stopListening, setTtsEnabled }}>
      {children}
    </ChatContext.Provider>
  );
};
