import ChatbotCards from '@/components/chatbot-cards'
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { getChatbotsByClerkId } from "@/db/chatbot";
import { Chatbot, Subscription } from "@/db/schema";
import { Prettify } from "@/types/helpers";
import Link from "next/link";
import React from "react";

interface Props {
  clerkId: string;
  sub: Prettify<Subscription & { chatbots: Chatbot[] }>;
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
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/dashboard/business-info">Edit Chatbot Context</Link>
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
