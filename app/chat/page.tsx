import ChatInterface from "@/components/ChatInterface";

export default function ChatPage() {
  return (
    <div className="h-screen w-screen bg-white dark:bg-zinc-900 flex flex-col">
      <header className="border-b border-zinc-200/70 p-3 dark:border-zinc-800/70 bg-white/70 dark:bg-zinc-900/70">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Mimir Chat</h1>
      </header>
      <main className="flex-1 overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  );
}
