import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils'
import { useUser } from '@clerk/nextjs';
import { Bot } from 'lucide-react';

interface ChatMessageProps {
  sender: string;
  message: string;
}

export default function ChatMessage({sender, message}: ChatMessageProps) {

  const {user} = useUser();

  return (
    <div
      className={cn(
        "flex gap-2 mb-4",
        sender === "user" ? "justify-end" : "justify-start"
      )}
    >
      {sender === 'user' ?
        <Avatar>
          <AvatarImage src={user?.imageUrl} />
          <AvatarFallback>{`${user?.firstName?.[0]}${user?.lastName?.[0]}`}</AvatarFallback>
        </Avatar> :
        <Bot />
      }
      <p
        className={cn(
          "max-w-[70%] p-3 rounded-lg text-sm font-outfit",
          sender === "user"
            ? "bg-primary text-white"
            : "bg-gray-100 text-gray-800"
        )}
      >
        {message}
      </p>
    </div>
  )
}
