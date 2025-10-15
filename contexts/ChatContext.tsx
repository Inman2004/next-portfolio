"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatContextType = {
  messages: ChatMessage[];
  input: string;
  loading: boolean;
  setInput: (input: string) => void;
  sendMessage: () => Promise<void>;
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

  React.useEffect(() => {
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
    <ChatContext.Provider value={{ messages, input, loading, setInput, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
};
