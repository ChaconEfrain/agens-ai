import React from 'react'
import { cn } from '@/lib/utils'
import { Dot } from "lucide-react";

interface ChatMessageProps {
  role: string;
  message: string;
}

export default function ChatMessage({
  role,
  message,
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
          "bg-primary text-white": role === "user",
          "bg-gray-100 text-gray-800": role === "assistant",
          "p-3": message !== "",
          "bg-red-200": message === "error",
        })}
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
