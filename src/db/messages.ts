import { Transaction } from "@/types/db-types";
import { db } from ".";
import { Chatbot, MessageInsert, messages } from "./schema";
import { and, asc, between, count, desc, eq, inArray, sql } from "drizzle-orm";
import { getSubscriptionByClerkId } from "./subscriptions";
import { getChatbotsByClerkId } from "./chatbot";

export async function createMessage(
  {
    chatbotId,
    sessionId,
    message,
    response,
    isTest,
    rewrittenMessage,
    inputTokens,
    outputTokens,
    rewriteInputTokens,
    rewriteOutputTokens,
    totalInputTokens,
    totalOutputTokens,
  }: Omit<
    MessageInsert,
    "id" | "liked" | "createdAt" | "isActive" | "updatedAt"
  >,
  trx: Transaction
) {
  return await trx
    .insert(messages)
    .values({
      chatbotId,
      sessionId,
      response,
      message,
      isTest,
      rewrittenMessage,
      inputTokens,
      outputTokens,
      rewriteInputTokens,
      rewriteOutputTokens,
      totalInputTokens,
      totalOutputTokens,
    })
    .returning();
}

export async function getLatestMessagesByChatbotId({
  chatbotId,
  sessionId,
  limit = 5,
}: {
  chatbotId: number;
  sessionId: string;
  limit?: number;
}) {
  const latestMessages = await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.chatbotId, chatbotId),
        eq(messages.sessionId, sessionId),
        eq(messages.isActive, true)
      )
    )
    .orderBy(desc(messages.createdAt))
    .limit(limit);

  return latestMessages.reverse();
}

export async function getActiveMessagesByChatbotId({
  chatbotId,
  sessionId,
}: {
  chatbotId: number;
  sessionId: string;
}) {
  const messagesList = await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.chatbotId, chatbotId),
        eq(messages.sessionId, sessionId),
        eq(messages.isActive, true)
      )
    )
    .orderBy(asc(messages.createdAt));

  return messagesList;
}

export async function getAllMessagesCountByChatbotId({
  chatbotId,
}: {
  chatbotId: number;
}) {
  const [{ count: messagesCount }] = await db
    .select({
      count: count(),
    })
    .from(messages)
    .where(eq(messages.chatbotId, chatbotId));

  return messagesCount;
}

export async function disableMessagesByChatbotId({
  chatbotId,
  sessionId,
}: {
  chatbotId: number;
  sessionId: string;
}) {
  await db
    .update(messages)
    .set({ isActive: false })
    .where(
      and(eq(messages.chatbotId, chatbotId), eq(messages.sessionId, sessionId))
    );
}

export async function getCurrentPeriodMessagesPerDayByClerkId({
  clerkId,
}: {
  clerkId: string;
}) {
  try {
    const [sub, chatbots] = await Promise.all([
      getSubscriptionByClerkId({ clerkId }),
      getChatbotsByClerkId({ clerkId }),
    ]);

    if (!sub) throw new Error("No subscription found");
    if (chatbots.length === 0) return [];

    const chatbotIds = chatbots.map((bot) => bot.id);

    const rows = await db.query.messages.findMany({
      where: and(
        inArray(messages.chatbotId, chatbotIds),
        between(messages.createdAt, sub.periodStart, sub.periodEnd),
        eq(messages.isTest, false)
      ),
      columns: {
        createdAt: true,
      },
      orderBy: asc(messages.createdAt),
    });

    return rows.reduce((acc, message) => {
      const date = new Date(message.createdAt);
      const dateString = date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
      });
      const existingEntry = acc.find((entry) => entry.date === dateString);
      if (existingEntry) {
        existingEntry.messages += 1;
      } else {
        acc.push({ date: dateString, messages: 1 });
      }
      return acc;
    }, [] as { date: string; messages: number }[]);
  } catch (error) {
    console.error(
      "Error on getCurrentPeriodMessagesPerDayByClerkId --> ",
      error
    );
    return [];
  }
}

export async function getAllMessagesByClerkId({
  clerkId,
}: {
  clerkId: string;
}) {
  try {
    const chatbots = await getChatbotsByClerkId({ clerkId });

    if (chatbots.length === 0) return [];

    const chatbotIds = chatbots.map((bot) => bot.id);

    const rows = await db.query.messages.findMany({
      where: and(
        inArray(messages.chatbotId, chatbotIds),
        eq(messages.isTest, false)
      ),
      with: {
        chatbot: true,
      },
      orderBy: desc(messages.createdAt),
    });

    return rows;
  } catch (error) {
    console.error(
      "Error on getCurrentPeriodMessagesPerDayByClerkId --> ",
      error
    );
    return [];
  }
}

export async function getCurrentPeriodMessagesPerChatbotPerDayByClerkId({
  clerkId,
}: {
  clerkId: string;
}) {
  try {
    const [sub, chatbots] = await Promise.all([
      getSubscriptionByClerkId({ clerkId }),
      getChatbotsByClerkId({ clerkId }),
    ]);

    if (!sub) throw new Error("No subscription found");
    if (chatbots.length === 0) return [];

    const chatbotIds = chatbots.map((bot) => bot.id);

    const rows = await db.query.messages.findMany({
      where: and(
        inArray(messages.chatbotId, chatbotIds),
        between(messages.createdAt, sub.periodStart, sub.periodEnd),
        eq(messages.isTest, false)
      ),
      orderBy: asc(messages.createdAt),
    });

    return rows.reduce((acc, message) => {
      const date = new Date(message.createdAt);
      const dateString = date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
      });
      const chatbot = chatbots.find(
        (bot) => bot.id === message.chatbotId
      ) as Chatbot;
      const existingEntry = acc.find(
        (entry) =>
          entry.chatbotSlug === chatbot.slug && entry.date === dateString
      );
      if (existingEntry) {
        existingEntry.messages += 1;
      } else {
        acc.push({ date: dateString, chatbotSlug: chatbot.slug, messages: 1 });
      }
      return acc;
    }, [] as { date: string; chatbotSlug: string; messages: number }[]);
  } catch (error) {
    console.error(
      "Error on getCurrentPeriodMessagesPerChatbotPerDayByClerkId --> ",
      error
    );
    return [];
  }
}

export async function getCurrentPeriodConversationsPerChatbotPerDayByClerkId({
  clerkId,
}: {
  clerkId: string;
}) {
  try {
    const [sub, chatbots] = await Promise.all([
      getSubscriptionByClerkId({ clerkId }),
      getChatbotsByClerkId({ clerkId }),
    ]);

    if (!sub) throw new Error("No subscription found");
    if (chatbots.length === 0) return [];

    const chatbotIds = chatbots.map((bot) => bot.id);

    const rows = await db.query.messages.findMany({
      where: and(
        inArray(messages.chatbotId, chatbotIds),
        between(messages.createdAt, sub.periodStart, sub.periodEnd),
        eq(messages.isTest, false)
      ),
      orderBy: asc(messages.createdAt),
    });

    const conversationMap = new Map<
      string,
      {
        date: string;
        chatbotSlug: string;
        conversations: number;
        sessionId: string;
      }
    >();

    for (const message of rows) {
      const date = new Date(message.createdAt as Date);
      const dateString = date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
      });
      const chatbot = chatbots.find(
        (bot) => bot.id === message.chatbotId
      ) as Chatbot;
      const key = `${dateString}-${message.sessionId}-${chatbot.slug}`;

      if (!conversationMap.has(key)) {
        conversationMap.set(key, {
          date: dateString,
          chatbotSlug: chatbot.slug,
          conversations: 1,
          sessionId: message.sessionId,
        });
      }
    }

    const aggregateMap = new Map<
      string,
      { date: string; chatbotSlug: string; conversations: number }
    >();

    for (const convo of conversationMap.values()) {
      const aggKey = `${convo.date}-${convo.chatbotSlug}`;
      if (aggregateMap.has(aggKey)) {
        aggregateMap.get(aggKey)!.conversations += 1;
      } else {
        aggregateMap.set(aggKey, {
          date: convo.date,
          chatbotSlug: convo.chatbotSlug,
          conversations: 1,
        });
      }
    }

    return Array.from(aggregateMap.values());
  } catch (error) {
    console.error(
      "Error on getCurrentPeriodConversationsPerChatbotPerDayByClerkId --> ",
      error
    );
    return [];
  }
}

export async function getConversationBySessionId({
  sessionId,
}: {
  sessionId: string;
}) {
  const conversation = await db.query.messages.findMany({
    where: eq(messages.sessionId, sessionId),
  });

  return conversation;
}

export async function updateMessageRating({
  messageId,
  rating,
}: {
  messageId: number;
  rating: "like" | "dislike" | null;
}) {
  await db
    .update(messages)
    .set({
      liked: rating === "like" ? true : rating === "dislike" ? false : null,
    })
    .where(eq(messages.id, messageId));
}