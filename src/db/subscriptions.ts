import { eq, sql } from "drizzle-orm";
import { db } from ".";
import { chatbots, SubscriptionInsert, subscriptions } from "./schema";
import { Transaction } from "@/types/db-types";

export async function createSubscription(
  {
    periodEnd,
    periodStart,
    plan,
    status,
    stripeCustomerId,
    stripeSubscriptionId,
    stripeItemId,
    userId,
  }: SubscriptionInsert,
  trx: Transaction
) {
  const subscription = await trx
    .insert(subscriptions)
    .values({
      periodEnd,
      periodStart,
      plan,
      status,
      stripeCustomerId,
      stripeSubscriptionId,
      stripeItemId,
      userId,
    })
    .returning({ id: subscriptions.id });

  return subscription;
}

export async function updateSubscription({
  periodStart,
  periodEnd,
  status,
  plan,
  stripeItemId,
  stripeSubscriptionId,
}: Omit<SubscriptionInsert, "messageCount" | "userId" | "stripeCustomerId">) {
  await db
    .update(subscriptions)
    .set({
      periodStart,
      periodEnd,
      status,
      plan,
      stripeItemId,
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
    })
    .where(
      eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId as string)
    );
}

export async function updateSubscriptionMessageCount({stripeSubscriptionId, messageCount}: {stripeSubscriptionId: string, messageCount: number}, trx: Transaction) {
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

  if (!chatbot.subscriptionId) return null;

  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.id, chatbot.subscriptionId),
    columns: {
      messageCount: true,
      status: true,
      plan: true,
      stripeSubscriptionId: true
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
