import { ChatbotStyles } from "@/types/embedded-chatbot";
import { db } from ".";
import { ChatbotInsert, chatbots, subscriptions } from "./schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "./user";
import { Transaction } from "@/types/db-types";

export async function createChatbot(
  {
    userId,
    instructions,
    businessId,
    allowedDomains,
    styles,
    slug,
    testMessagesCount,
    subscriptionId,
  }: ChatbotInsert,
  trx: Transaction
) {
  return await trx
    .insert(chatbots)
    .values({
      userId,
      instructions,
      businessId,
      allowedDomains,
      styles,
      slug,
      testMessagesCount,
      subscriptionId,
    })
    .returning({ id: chatbots.id });
}

export async function getChatbotBySlug({ slug }: { slug: string }) {
  try {
    const chatbot = await db.query.chatbots.findFirst({
      where: eq(chatbots.slug, slug),
      with: {
        business: true,
        files: true,
      },
    });

    if (!chatbot) throw new Error("Chatbot not found");

    return chatbot;
  } catch (error) {
    console.error(error);
  }
}

export async function updateChatbotStyles({
  slug,
  styles,
}: {
  slug: string;
  styles: ChatbotStyles;
}) {
  const { userId } = await auth();

  if (!userId) throw new Error("No session detected");

  await db.update(chatbots).set({ styles }).where(eq(chatbots.slug, slug));
}

export async function updateChatbotsSubscription(
  {
    subscriptionId,
    userId,
  }: {
    subscriptionId: number;
    userId: number;
  },
  trx: Transaction
) {
  await trx
    .update(chatbots)
    .set({
      subscriptionId,
    })
    .where(eq(chatbots.userId, userId));
}

export async function updateChatbotCurrentMessageCount(
  {
    chatbotId,
  }: {
    chatbotId: number;
  },
  trx: Transaction
) {
  await trx
    .update(chatbots)
    .set({
      currentPeriodMessagesCount: sql`${
        chatbots.currentPeriodMessagesCount
      } + ${1}`,
    })
    .where(eq(chatbots.id, chatbotId));
}

export async function updateChatbotTestMessageCount(
  {
    chatbotId,
    testMessagesCount,
  }: {
    chatbotId: number;
    testMessagesCount: number;
  },
  trx: Transaction
) {
  await trx
    .update(chatbots)
    .set({
      testMessagesCount,
    })
    .where(eq(chatbots.id, chatbotId));
}

export async function getChatbotTestMessageCount({
  chatbotId,
}: {
  chatbotId: number;
}) {
  const messageCount = await db.query.chatbots.findFirst({
    where: eq(chatbots.id, chatbotId),
    columns: {
      testMessagesCount: true,
    },
  });

  if (!messageCount) throw new Error("Chatbot not found");

  return messageCount.testMessagesCount;
}

export async function getChatbotsByClerkId({ clerkId }: { clerkId: string }) {
  try {
    const user = await getUserByClerkId({ clerkId });
    const userChatbots = await db.query.chatbots.findMany({
      where: eq(chatbots.userId, user.id),
      with: {
        business: true,
        messages: true,
      },
    });

    return userChatbots;
  } catch (error) {
    console.error("Error on getChatbotsByClerkId --> ", error);
    return [];
  }
}

export async function deleteChatbot({ chatbotId }: { chatbotId: number }) {
  await db.delete(chatbots).where(eq(chatbots.id, chatbotId));
}