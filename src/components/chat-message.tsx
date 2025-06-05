"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Dot } from "lucide-react";
import { ChatbotStyles } from "@/types/embedded-chatbot";
interface ChatMessageProps {
  role: string;
  message: string;
  styles?: ChatbotStyles;
}

export default function ChatMessage({
  role,
  message,
  styles,
}: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex mb-4",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <p
        className={cn("max-w-[70%] rounded-lg text-sm font-outfit", {
          "text-white": role === "user",
          "bg-gray-100 text-gray-800": role === "assistant",
          "p-3": message !== "",
          "bg-red-200": message === "error",
        })}
        style={{
          backgroundColor:
            role === "user"
              ? styles?.chat.userBgColor ?? "oklch(0.21 0.006 285.885)"
              : styles?.chat.botBgColor ?? "#f3f4f6",
          color:
            role === "user"
              ? styles?.chat.userTextColor ?? "#ffffff"
              : styles?.chat.botTextColor ?? "#1e2939",
        }}
      >
        {message !== "" ? (
          message === "error" ? (
            "⚠️ Something went wrong, please try again."
          ) : (
            message
          )
        ) : (
          <span className="flex">
            <Dot className="animate-bounce delay-0" />
            <Dot className="animate-bounce delay-200 -ml-4" />
            <Dot className="animate-bounce delay-400 -ml-4" />
          </span>
        )}
      </p>
    </div>
  );
}
