import React from "react";
import { getChatbotBySlug } from "@/db/chatbot";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Chat from "@/components/chat";
import ChatbotContext from "./_components/chatbot-context";

export default async function TestChatbot({
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
        <h1 className="text-3xl font-bold">{chatbot.business.name} Chatbot</h1>
        <p className="text-muted-foreground">
          Test your chatbot before deploying it to your website
        </p>
      </header>
      <main>
        <div className="grid grid-cols-[70fr_30fr] gap-4">
          <section className="h-[80dvh]">
            <Chat
              chatbotId={chatbot.id}
              chatbotSlug={chatbot.slug}
              chatbotInstructions={chatbot.instructions}
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
