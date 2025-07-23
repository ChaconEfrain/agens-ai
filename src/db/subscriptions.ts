import { eq } from "drizzle-orm";
import { db } from ".";
import { chatbots, SubscriptionInsert, subscriptions } from "./schema";
import { Transaction } from "@/types/db-types";
import { getUserByClerkId } from "./user";
import { resetChatbotsCurrentMessageCountByUserId } from "./chatbot";

export async function createDefaultSubscription({
  userId,
}: {
  userId: number;
}) {
  await db.insert(subscriptions).values({
    plan: "free",
    userId,
  });
}

export async function createSubscription({
  plan,
  periodEnd,
  periodStart,
  status,
  stripeCustomerId,
  stripeSubscriptionId,
  userId,
}: Omit<SubscriptionInsert, "createdAt" | "updatedAt" | "messageCount">) {
  await db
    .update(subscriptions)
    .set({
      plan,
      periodEnd,
      periodStart,
      status,
      stripeCustomerId,
      stripeSubscriptionId,
    })
    .where(eq(subscriptions.userId, userId));
}

export async function updateSubscription({
  periodStart,
  periodEnd,
  status,
  plan,
  stripeSubscriptionId,
}: Omit<SubscriptionInsert, "userId" | "stripeCustomerId" | "messageCount">) {
  const existing = await db.query.subscriptions.findFirst({
    where: eq(
      subscriptions.stripeSubscriptionId,
      stripeSubscriptionId as string
    ),
  });

  if (!existing) throw new Error("No subscription found");

  const newPeriodStart = periodStart;
  let currentMessageCount = existing.messageCount;

  if (existing.periodStart?.getTime() !== newPeriodStart?.getTime()) {
    currentMessageCount = 0;
    await resetChatbotsCurrentMessageCountByUserId({ userId: existing.userId });
  }

  return await db
    .update(subscriptions)
    .set({
      periodStart,
      periodEnd,
      status,
      plan,
      messageCount: currentMessageCount,
    })
    .where(
      eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId as string)
    );
}

export async function cancelSubscription({
  status,
  stripeSubscriptionId,
}: Pick<SubscriptionInsert, "stripeSubscriptionId" | "status">) {
  await db
    .update(subscriptions)
    .set({
      status,
      plan: "free",
      messageCount: 0,
      periodEnd: null,
      periodStart: null,
      stripeSubscriptionId: null,
    })
    .where(
      eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId as string)
    );
}

export async function updateSubscriptionMessageCount(
  {
    stripeSubscriptionId,
    messageCount,
  }: { stripeSubscriptionId: string; messageCount: number },
  trx: Transaction
) {
  await trx
    .update(subscriptions)
    .set({
      messageCount,
    })
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));
}

export async function getSubscriptionByChatbotId({
  chatbotId,
}: {
  chatbotId: number;
}) {
  const chatbot = await db.query.chatbots.findFirst({
    where: eq(chatbots.id, chatbotId),
  });

  if (!chatbot) throw new Error("Chatbot not found");

  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.id, chatbot.subscriptionId),
    columns: {
      messageCount: true,
      status: true,
      plan: true,
      stripeSubscriptionId: true,
    },
  });

  if (!subscription) throw new Error("Subscription not found");

  return subscription;
}

export async function getSubscriptionByUserId({ userId }: { userId: number }) {
  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
  });

  return subscription;
}

export async function getSubscriptionByClerkId({
  clerkId,
}: {
  clerkId: string;
}) {
  try {
    const user = await getUserByClerkId({ clerkId });
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, user.id),
      with: {
        chatbots: true,
      },
    });

    return subscription;
  } catch (error) {
    console.error("error on getSubscriptionByClerkId --> ", error);
  }
}
