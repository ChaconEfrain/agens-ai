import ChatbotCards from '@/components/chatbot-cards'
import { Card, CardHeader } from '@/components/ui/card'
import { getChatbotsByClerkId } from "@/db/chatbot";
import { Subscription } from "@/db/schema";
import React from "react";

interface Props {
  clerkId: string;
  sub: Subscription;
}

export default async function UserChatbots({ clerkId, sub }: Props) {
  const chatbots = await getChatbotsByClerkId({ clerkId });

  return (
    <section className="col-start-3 col-end-4 row-span-full">
      <Card className="h-full">
        <CardHeader>
          <h2 className="text-2xl font-semibold">Your Chatbots</h2>
        </CardHeader>
        <ChatbotCards userChatbots={chatbots} sub={sub} />
      </Card>
    </section>
  );
}
