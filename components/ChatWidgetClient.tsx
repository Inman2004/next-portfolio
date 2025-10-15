"use client";

import dynamic from "next/dynamic";

const DynamicChatWidget = dynamic(() => import('@/components/ChatWidget').then(mod => ({ default: mod.default })), {
  ssr: false,
});

export default function ChatWidgetClient() {
  return <DynamicChatWidget />;
}
