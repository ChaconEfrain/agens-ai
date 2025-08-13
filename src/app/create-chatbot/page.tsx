import React from "react";
import FormWizard from "./_components/form-wizard";
import OwnedChatbots from "./_components/owned-chatbots";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getChatbotsByClerkId } from "@/db/chatbot";
import { ALLOWED_CHATBOTS } from "@/consts/subscription";
import { getSubscriptionByClerkId } from "@/db/subscriptions";

export default async function CreateChatbotPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const [userChatbots, userSub] = await Promise.all([
    getChatbotsByClerkId({
      clerkId: userId,
    }),
    getSubscriptionByClerkId({ clerkId: userId }),
  ]);

  const limitReached =
    (userChatbots?.filter((bot) => bot.isActive).length ?? 0) >=
    ALLOWED_CHATBOTS[userSub?.plan.toUpperCase() as "BASIC" | "PRO" | "FREE"];

  return (
    <main className="my-10">
      <div className="grid grid-cols-[2fr_1fr] gap-4">
        <FormWizard limitReached={limitReached} />
        <OwnedChatbots userChatbots={userChatbots} userSub={userSub} />
      </div>
    </main>
  );
}
