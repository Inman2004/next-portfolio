"use client";

import dynamic from "next/dynamic";

const DynamicChatWidget = dynamic(() => import('@/components/ChatWidget'), {
  ssr: false,
});

export default function ChatWidgetClient() {
  return <DynamicChatWidget />;
}
