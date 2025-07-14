import React from 'react'
import DataTable from './_components/messages-table/data-table'
import { columns } from './_components/messages-table/columns'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation';
import {
  getCurrentPeriodConversationsPerChatbotPerDayByClerkId,
  getAllMessagesByClerkId,
  getCurrentPeriodMessagesPerChatbotPerDayByClerkId,
} from "@/db/messages";
import { getChatbotsByClerkId } from "@/db/chatbot";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import MessagesPerChatbotChart from "./_components/messages-per-chatbot-chart";
import ConversationsPerChatbotChart from "./_components/conversations-per-chatbot-chart";

export default async function MessageHistoryPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const [messages, chatbots, messagesPerChatbot, conversationsPerChatbot] =
    await Promise.all([
      getAllMessagesByClerkId({ clerkId: userId }),
      getChatbotsByClerkId({ clerkId: userId }),
      getCurrentPeriodMessagesPerChatbotPerDayByClerkId({ clerkId: userId }),
      getCurrentPeriodConversationsPerChatbotPerDayByClerkId({
        clerkId: userId,
      }),
    ]);

  return (
    <main className="flex flex-col gap-4 mt-6">
      <header>
        <h1 className="text-3xl font-semibold">Message History Overview</h1>
        <p className="text-muted-foreground">
          Explore all your messages and conversations from the current
          subscription period, along with your complete message archive.
        </p>
      </header>
      <section className="grid grid-cols-2 gap-4">
        <Card className="h-full">
          <CardHeader>
            <h2 className="text-2xl font-semibold">
              Current period messages per chatbot
            </h2>
          </CardHeader>
          <CardContent>
            <MessagesPerChatbotChart
              messagesPerDay={messagesPerChatbot}
              chatbots={chatbots.map((bot) => bot.slug)}
            />
          </CardContent>
        </Card>
        <Card className="h-full">
          <CardHeader>
            <h2 className="text-2xl font-semibold">
              Current period conversations per chatbot
            </h2>
          </CardHeader>
          <CardContent>
            <ConversationsPerChatbotChart
              conversationsPerDay={conversationsPerChatbot}
              chatbots={chatbots.map((bot) => bot.slug)}
            />
          </CardContent>
        </Card>
      </section>
      <section>
        <DataTable
          columns={columns}
          data={messages}
          chatbots={chatbots.map((bot) => bot.slug)}
        />
      </section>
    </main>
  );
}
