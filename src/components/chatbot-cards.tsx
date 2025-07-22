import React from 'react'
import { CardContent } from './ui/card'
import ChatbotCard from './chatbot-card'
import { Prettify } from '@/types/helpers';
import { Business, Chatbot, Message } from '@/db/schema';
import Banner from "./banner";

interface Props {
  userChatbots:
    | Prettify<Chatbot & { messages: Message[] } & { business: Business }>[]
    | undefined;
}

export default function ChatbotCards({ userChatbots }: Props) {
  return (
    <CardContent className="overflow-y-scroll [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-accent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground flex flex-col gap-2 h-full">
      {(userChatbots?.length ?? 0) > 0 ? (
        userChatbots?.map((bot) => <ChatbotCard key={bot.id} bot={bot} />)
      ) : (
        <Banner
          bannerMessage="You don't have any chatbots yet"
          className="py-12"
        />
      )}
    </CardContent>
  );
}
