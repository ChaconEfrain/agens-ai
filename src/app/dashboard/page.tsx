import React from 'react'
import UserPlan from './_components/user-plan'
import MessagesChart from './_components/messages-chart'
import UserChatbots from './_components/user-chatbots'
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSubscriptionByClerkId } from "@/db/subscriptions";

export default async function DashboardPage() {
  const { userId } = await auth();
  const sub = await getSubscriptionByClerkId({ clerkId: userId ?? "" });

  if (!userId || !sub) {
    redirect("/");
  }

  return (
    <main className="my-10">
      <div className="grid grid-cols-3 grid-rows-[30fr_70fr] h-full max-h-[720px] gap-4">
        <UserPlan sub={sub} />
        <MessagesChart userId={userId} />
        <UserChatbots userId={userId} />
      </div>
    </main>
  );
}
