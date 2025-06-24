"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Dot, ThumbsDown, ThumbsUp } from "lucide-react";
import { ChatbotStyles } from "@/types/embedded-chatbot";
import { rateMessageAction } from "@/actions/chatbot-messages";
interface ChatMessageProps {
  response: string;
  message: string;
  messageId: number;
  liked: boolean | null;
  styles?: ChatbotStyles;
}

export default function ChatMessage({
  response,
  message,
  messageId,
  liked,
  styles,
}: ChatMessageProps) {
  const [rating, setRating] = useState<"like" | "dislike" | null>(
    liked ? "like" : liked === false ? "dislike" : null
  );

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const id = e.currentTarget.id;
    const current = rating;
    if (!["like", "dislike"].includes(id)) return;

    if (id === "like") {
      setRating((prev) => (prev === "like" ? null : "like"));
    } else if (id === "dislike") {
      setRating((prev) => (prev === "dislike" ? null : "dislike"));
    }

    const { success } = await rateMessageAction({
      messageId,
      rating: id as "like" | "dislike" | null,
    });

    if (!success) {
      setRating(current);
    }
  };

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
      <div className="flex mb-4 justify-start relative">
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
        {response !== "" &&
          response !== "error" &&
          response !== "limit reached" && (
            <div className="absolute left-2 -bottom-5 flex items-center gap-2">
              <button
                id="like"
                className="cursor-pointer"
                onClick={handleClick}
              >
                <ThumbsUp
                  className={cn("size-[13px]", {
                    "fill-primary": rating === "like",
                  })}
                  strokeWidth={rating === "like" ? 0 : 2}
                />
              </button>
              <button
                id="dislike"
                className="cursor-pointer"
                onClick={handleClick}
              >
                <ThumbsDown
                  className={cn("size-[13px]", {
                    "fill-primary": rating === "dislike",
                  })}
                  strokeWidth={rating === "dislike" ? 0 : 2}
                />
              </button>
            </div>
          )}
      </div>
    </>
  );
}
