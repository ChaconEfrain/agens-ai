'use client'

import React, { useState } from 'react'
import { ScriptDisplay } from "./script-display";
import Customization from "./customization";
import EmbedPreview from "./embed-preview";
import { ChatbotStyles } from "@/types/embedded-chatbot";
import ChatbotReady from "./chatbot-ready";
import { Chatbot } from "@/db/schema";

interface Props {
  chatbot: Chatbot;
  styles: ChatbotStyles;
}

export default function ScriptContainer({
  chatbot,
  styles: chatbotStyles,
}: Props) {
  const [styles, setStyles] = useState<ChatbotStyles>(chatbotStyles);

  const updateStyles = (updates: Partial<ChatbotStyles>) => {
    setStyles({ ...styles, ...updates });
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <ChatbotReady isActive={chatbot.isActive} />
        <ScriptDisplay slug={chatbot.slug} />
      </div>
      <Customization
        styles={styles}
        updateStyles={updateStyles}
        slug={chatbot.slug}
      />
      <EmbedPreview styles={styles} />
    </>
  );
}
