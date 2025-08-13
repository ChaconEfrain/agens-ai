import Chat from '@/components/chat';
import { getChatbotBySlug } from '@/db/chatbot';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import React from 'react'
import ChatbotContext from './chatbot-context';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default async function PageContainer({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const { slug } = await params;
  const chatbot = await getChatbotBySlug({ slug });

  if (!chatbot) notFound();
  return (
    <div>
      <header className="my-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          {chatbot.business.name} Chatbot{" "}
          <Badge
            className={cn({
              "bg-green-50 text-green-700 border-green-200 ": chatbot.isActive,
              "bg-red-50 text-red-700 border-red-200 ": !chatbot.isActive,
            })}
          >
            {chatbot.isActive ? "Active" : "Inactive"}
          </Badge>
        </h1>
        <p className="text-muted-foreground">
          Test your chatbot before deploying it to your website. These messages
          won't count to your plan limit.
        </p>
      </header>
      <main>
        <div className="grid grid-cols-[70fr_30fr] gap-4">
          <section className="h-[80dvh]">
            <Chat
              chatbotId={chatbot.id}
              chatbotSlug={chatbot.slug}
              chatbotInstructions={chatbot.instructions}
              chatbotIsActive={chatbot.isActive}
            />
          </section>
          <section className="h-[80dvh]">
            <ChatbotContext chatbot={chatbot} />
          </section>
        </div>
      </main>
    </div>
  );
}
