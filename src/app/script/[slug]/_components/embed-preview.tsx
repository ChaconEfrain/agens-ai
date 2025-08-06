'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Globe } from "lucide-react";
import React, { useState } from "react";
import MockChat from "@/components/mock-chat";
import { ChatbotStyles } from "@/types/embedded-chatbot";
import { cn } from "@/lib/utils";

interface Props {
  styles: ChatbotStyles;
}

export default function EmbedPreview({ styles }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <Card className="col-span-full">
      <CardHeader className="gap-0">
        <CardTitle>
          <h2 className="text-2xl">Embed Preview</h2>
        </CardTitle>
        <CardDescription>
          <p>See how your chatbot will appear on your website</p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative bg-gray-100 rounded-lg p-8 min-h-screen overflow-hidden">
          <div className="text-center text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Your Website</p>
            <p className="text-sm">
              The chatbot will appear as a floating widget
            </p>
          </div>
          <div
            className={`absolute bg-transparent shadow-lg ${
              styles.position.includes("bottom") ? "bottom-20" : "top-20"
            } ${styles.position.includes("right") ? "right-4" : "left-4"} ${
              open ? "block" : "hidden"
            }`}
            style={{
              width: styles.chat.width,
              height: styles.chat.height,
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            <MockChat styles={styles} />
            {styles.chat.showBranding && (
              <p className="absolute top-2 right-4 text-xs text-muted-foreground">
                Powered by{" "}
                <a
                  href="https://agens.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  AgensAI
                </a>
              </p>
            )}
          </div>
          <button
            className={cn(
              "cursor-pointer absolute flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.1)]",
              {
                "bottom-4": styles.position.includes("bottom"),
                "top-4": !styles.position.includes("bottom"),
                "right-4": styles.position.includes("right"),
                "left-4": !styles.position.includes("right"),
              }
            )}
            style={{
              width: styles.button.width,
              height: styles.button.height,
              backgroundColor: styles.button.bgColor,
              borderRadius: styles.button.borderRadius,
            }}
            onClick={() => setOpen(!open)}
          >
            <img
              src={styles.button.icon}
              alt="Chatbot icon"
              className="size-8"
            />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
