'use client'

import React, { useState } from 'react'
import { ScriptDisplay } from "./script-display";
import Customization from "./customization";
import EmbedPreview from "./embed-preview";
import { ChatbotStyles } from "@/types/embedded-chatbot";
import ChatbotReady from "./chatbot-ready";

interface Props {
  slug: string;
  styles: ChatbotStyles | null;
}

const defaultStyles: ChatbotStyles = {
  position: "bottom-right",
  chat: {
    width: 350,
    height: 500,
    userBgColor: "#2b2233",
    userTextColor: "#ffffff",
    botBgColor: "#f3f4f6",
    botTextColor: "#1e2939",
    showBranding: true,
  },
  button: {
    width: 50,
    height: 50,
    bgColor: "#2b2233",
    icon: "",
    borderRadius: 30,
  },
};

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
