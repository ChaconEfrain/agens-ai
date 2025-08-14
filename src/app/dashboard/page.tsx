import React from 'react'
import UserPlan from './_components/user-plan'
import MessagesChart from './_components/messages-chart'
import UserChatbots from './_components/user-chatbots'
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSubscriptionByClerkId } from "@/db/subscriptions";
import CurrentMessages from "./_components/current-messages";
import Link from "next/link";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import MessageHistoryLink from "./_components/message-history-link";

export default async function DashboardPage() {
  const { userId } = await auth();
  const sub = await getSubscriptionByClerkId({ clerkId: userId ?? "" });

  if (!userId || !sub) {
    redirect("/");
  }

  return (
    <main className="my-10 space-y-4">
      <header>
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">
              Track your daily usage and monitor your current subscription
              activity.
            </p>
            <Tooltip>
              <TooltipTrigger className="text-muted-foreground">
                <Info />
              </TooltipTrigger>
              <TooltipContent>
                <span>Updates every 5 minutes.</span>
              </TooltipContent>
            </Tooltip>
          </div>
          {sub.chatbots.length > 0 ? (
            <MessageHistoryLink sub={sub} />
          ) : (
            <Button asChild>
              <Link href="/create-chatbot">Create Chatbot</Link>
            </Button>
          )}
        </div>
      </header>
      <div className="grid grid-cols-3 grid-rows-[30fr_70fr] h-full max-h-[720px] gap-4">
        <UserPlan sub={sub} clerkId={userId} />
        <CurrentMessages clerkId={userId} />
        <MessagesChart clerkId={userId} sub={sub} />
        <UserChatbots clerkId={userId} sub={sub} />
      </div>
    </main>
  );
}
