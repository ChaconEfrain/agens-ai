'use client'

import React, { useState } from 'react'
import { ScriptDisplay } from "./script-display";
import Customization from "./customization";
import EmbedPreview from "./embed-preview";
import { ChatbotStyles } from "@/types/embedded-chatbot";
import ChatbotReady from "./chatbot-ready";
import { defaultStyles } from "@/consts/chatbot";

interface Props {
  slug: string;
  styles: ChatbotStyles;
}

export default function PageContainer({ slug, styles: chatbotStyles }: Props) {
  const [styles, setStyles] = useState<ChatbotStyles>(
    chatbotStyles ?? defaultStyles
  );

  const updateStyles = (updates: Partial<ChatbotStyles>) => {
    setStyles({ ...styles, ...updates });
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <ChatbotReady />
        <ScriptDisplay slug={slug} />
      </div>
      <Customization styles={styles} updateStyles={updateStyles} slug={slug} />
      <EmbedPreview styles={styles} />
    </>
  );
}
