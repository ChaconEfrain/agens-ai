import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils'
import { useUser } from '@clerk/nextjs';
import { Bot, Dot } from "lucide-react";

interface ChatMessageProps {
  sender: string;
  message: string;
}

export default function ChatMessage({ sender, message }: ChatMessageProps) {
  const { user } = useUser();

  return (
    <div
      className={cn(
        "flex gap-2 mb-4",
        sender === "user" ? "justify-end" : "justify-start"
      )}
    >
      {sender === "user" ? (
        <Avatar>
          <AvatarImage src={user?.imageUrl} />
          <AvatarFallback>{`${user?.firstName?.[0]}${user?.lastName?.[0]}`}</AvatarFallback>
        </Avatar>
      ) : (
        <Bot />
      )}
      <p
        className={cn("max-w-[70%] rounded-lg text-sm font-outfit", {
          "bg-primary text-white": sender === "user",
          "bg-gray-100 text-gray-800": sender === "ai",
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
