'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Globe, MessageCircle } from "lucide-react";
import React, { useState } from "react";
import { ScriptStyles } from "./page-container";
import MockChat from "./mock-chat";

interface Props {
  styles: ScriptStyles;
}

export default function EmbedPreview({ styles }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle><h2>Embed Preview</h2></CardTitle>
        <CardDescription>
          <p>
            See how your chatbot will appear on your website
          </p>
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
            } ${styles.position.includes("right") ? "right-4" : "left-4"} ${open ? "block" : "hidden"}`}
            style={{
              width: styles.width,
              height: styles.height,
              boxSizing: "border-box",
              fontFamily: "sans-serif",
              overflow: "hidden",
            }}
          >
            <MockChat styles={styles} />
            {styles.showBranding && (
              <p
                className="absolute top-2 right-4 text-xs text-muted-foreground"
              >
                Powered by <a href="https://agens.ai" target="_blank" rel="noopener noreferrer" className="hover:underline">AgensAI</a>
              </p>
            )}
          </div>
          <button className={`cursor-pointer ${
              styles.position.includes("bottom") ? "bottom-4" : "top-4"
            } ${styles.position.includes("right") ? "right-4" : "left-4"}`} style={{
            position: "absolute",
            backgroundColor: styles?.primaryColor,
            borderRadius: "50%",
            padding: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }} onClick={() => setOpen(!open)}>
            <MessageCircle className="text-white" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
