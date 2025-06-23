import React from 'react'
import { CardContent } from './ui/card'
import ChatbotCard from './chatbot-card'
import { Prettify } from '@/types/helpers';
import { Business, Chatbot, Message } from '@/db/schema';
import { Bot } from 'lucide-react';

interface Props {
  userChatbots:
    | Prettify<Chatbot & { messages: Message[] } & { business: Business }>[]
    | undefined;
}

export default function ChatbotCards({userChatbots}: Props) {
  return (
    <CardContent className="overflow-y-scroll [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-accent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground flex flex-col gap-2 h-full">
      {(userChatbots?.length ?? 0) > 0 ? (
        userChatbots?.map((bot) => <ChatbotCard key={bot.id} bot={bot} />)
      ) : (
        <div className="flex flex-col gap-2 items-center justify-center py-12">
          <Bot className="size-12" />
          <p className="text-lg text-muted-foreground font-medium">
            You don't have any chatbots yet
          </p>
        </div>
      )}
    </CardContent>
  )
}
