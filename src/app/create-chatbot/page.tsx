import React from "react";
import FormWizard from "./_components/form-wizard";
import OwnedChatbots from "./_components/owned-chatbots";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getChatbotsAndSubByClerkId } from "@/db/chatbot";
import { ALLOWED_CHATBOTS } from "@/consts/subscription";

export default async function CreateChatbotPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const { userChatbots, userSub } = await getChatbotsAndSubByClerkId({
    clerkId: userId,
  });
  const hasChatbotButNoSub =
    !userSub && (userChatbots?.length ?? 0) >= ALLOWED_CHATBOTS.FREE;
  const hasSubButChatbotLimit =
    !!userSub &&
    (userChatbots?.length ?? 0) >=
      ALLOWED_CHATBOTS[userSub.plan.toUpperCase() as "BASIC" | "PRO"];
  const hasChatbotAndCanceledSub =
    !!userSub &&
    userSub.status === "canceled" &&
    (userChatbots?.length ?? 0) >= ALLOWED_CHATBOTS.FREE;
  return (
    <main className="my-10">
      <div className="grid grid-cols-[70fr_30fr] gap-6">
        <FormWizard
          limitReached={
            hasChatbotButNoSub ||
            hasSubButChatbotLimit ||
            hasChatbotAndCanceledSub
          }
        />
        <OwnedChatbots userChatbots={userChatbots} userSub={userSub} />
      </div>
    </main>
  );
}
