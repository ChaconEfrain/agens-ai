import { ChatbotStyles } from "@/types/embedded-chatbot";
import { db } from ".";
import { businesses, ChatbotInsert, chatbots } from "./schema";
import { and, eq, inArray, sql } from "drizzle-orm";
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
    pdfInputTokens,
    pdfOutputTokens,
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
      pdfInputTokens,
      pdfOutputTokens,
    })
    .returning({
      id: chatbots.id,
      pdfInputTokens: chatbots.pdfInputTokens,
      pdfOutputTokens: chatbots.pdfOutputTokens,
    });
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

  const user = await getUserByClerkId({ clerkId: userId });

  await db
    .update(chatbots)
    .set({ styles })
    .where(and(eq(chatbots.slug, slug), eq(chatbots.userId, user.id)));
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

export async function resetChatbotsCurrentMessageCountByUserId({
  userId,
}: {
  userId: number;
}) {
  await db
    .update(chatbots)
    .set({
      currentPeriodMessagesCount: 0,
    })
    .where(eq(chatbots.userId, userId));
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

export async function deleteChatbotAndBusiness({
  businessId,
}: {
  businessId: number;
}) {
  await db.delete(businesses).where(eq(businesses.id, businessId));
}

export async function updateChatbotPdfTokens(
  {
    pdfInputTokens,
    pdfOutputTokens,
    chatbotId,
  }: {
    pdfInputTokens: number;
    pdfOutputTokens: number;
    chatbotId: number;
  },
  trx?: Transaction
) {
  const database = trx ?? db;
  await database
    .update(chatbots)
    .set({
      pdfInputTokens,
      pdfOutputTokens,
    })
    .where(eq(chatbots.id, chatbotId));
}

export async function toggleDeactivateChatbotAtPeriodEnd({
  deactivateAtPeriodEnd,
  activeChatbot,
  subscriptionId,
}: {
  deactivateAtPeriodEnd: boolean;
  activeChatbot: number;
  subscriptionId: number;
}) {
  const userChatbots = await getChatbotsBySubscriptionId({ subscriptionId });
  const ids = userChatbots
    .filter((bot) => bot.id !== activeChatbot)
    .map((bot) => bot.id);

  await db
    .update(chatbots)
    .set({
      deactivateAtPeriodEnd,
    })
    .where(inArray(chatbots.id, ids));
}

export async function getChatbotsBySubscriptionId({
  subscriptionId,
}: {
  subscriptionId: number;
}) {
  return await db.query.chatbots.findMany({
    where: eq(chatbots.subscriptionId, subscriptionId),
  });
}

export async function deactivateMarkedChatbotsBySubscriptionId({
  subscriptionId,
}: {
  subscriptionId: number;
}) {
  const userChatbots = await getChatbotsBySubscriptionId({ subscriptionId });
  const ids = userChatbots
    .filter((bot) => bot.deactivateAtPeriodEnd)
    .map((bot) => bot.id);

  await db
    .update(chatbots)
    .set({
      isActive: false,
      deactivateAtPeriodEnd: false,
    })
    .where(inArray(chatbots.id, ids));
}

export async function deactivateChatbotsBySubscriptionId({
  activeChatbot,
  subscriptionId,
}: {
  activeChatbot: number;
  subscriptionId: number;
}) {
  const userChatbots = await getChatbotsBySubscriptionId({ subscriptionId });
  const ids = userChatbots
    .filter((bot) => bot.id !== activeChatbot)
    .map((bot) => bot.id);

  await db
    .update(chatbots)
    .set({
      isActive: false,
    })
    .where(inArray(chatbots.id, ids));
}

export async function activateChatbotsBySubscriptionId({
  subscriptionId,
}: {
  subscriptionId: number;
}) {
  const userChatbots = await getChatbotsBySubscriptionId({ subscriptionId });
  const ids = userChatbots.map((bot) => bot.id);

  await db
    .update(chatbots)
    .set({
      isActive: true,
    })
    .where(inArray(chatbots.id, ids));
}