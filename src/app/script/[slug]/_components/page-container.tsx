import { getChatbotBySlug } from "@/db/chatbot";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import React from "react";
import ScriptContainer from "./script-container";

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
        <h1 className="text-3xl font-bold">{chatbot.business.name} Chatbot</h1>
        <p className="text-muted-foreground">
          Your chatbot is ready! Copy the script below and paste it into your
          website to start engaging with your customers.
        </p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        <ScriptContainer slug={slug} styles={chatbot.styles} />
      </div>
    </div>
  );
}
