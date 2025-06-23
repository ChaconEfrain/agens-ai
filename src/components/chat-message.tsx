"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Dot } from "lucide-react";
import { ChatbotStyles } from "@/types/embedded-chatbot";
interface ChatMessageProps {
  response: string;
  message: string;
  styles?: ChatbotStyles;
}

export default function ChatMessage({
  response,
  message,
  styles,
}: ChatMessageProps) {
  return (
    <>
      <div className="flex mb-4 justify-end">
        <p
          className={cn("max-w-[70%] rounded-lg text-sm font-outfit", {
            "p-3": message !== "",
          })}
          style={{
            backgroundColor:
              styles?.chat.userBgColor ?? "oklch(0.21 0.006 285.885)",
            color: styles?.chat.userTextColor ?? "#ffffff",
          }}
        >
          {message !== "" ? (
            message === "error" ? (
              "⚠️ Something went wrong, please try again."
            ) : message === "limit reached" ? (
              "⚠️ Message limit reached."
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
      <div className="flex mb-4 justify-start">
        <p
          className={cn("max-w-[70%] rounded-lg text-sm font-outfit", {
            "p-3": response !== "",
            "bg-red-200": response === "error" || response === "limit reached",
          })}
          style={{
            backgroundColor:
              response === "error" || response === "limit reached"
                ? "oklch(88.5% 0.062 18.334)"
                : styles?.chat.botBgColor ?? "#f3f4f6",
            color: styles?.chat.botTextColor ?? "#1e2939",
          }}
        >
          {response !== "" ? (
            response === "error" ? (
              "⚠️ Something went wrong, please try again."
            ) : response === "limit reached" ? (
              "⚠️ Message limit reached."
            ) : (
              response
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
    </>
  );
}
