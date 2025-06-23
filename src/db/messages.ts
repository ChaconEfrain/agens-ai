import { Transaction } from "@/types/db-types";
import { db } from ".";
import { messages } from "./schema";
import {
  and,
  asc,
  between,
  count,
  desc,
  eq,
  gte,
  inArray,
  lte,
  sql,
} from "drizzle-orm";
import { getSubscriptionByClerkId } from "./subscriptions";
import { getChatbotsByClerkId } from "./chatbot";

export async function createMessage(
  {
    chatbotId,
    sessionId,
    message,
    response,
  }: {
    chatbotId: number;
    sessionId: string;
    message: string;
    response: string;
  },
  trx: Transaction
) {
  await trx.insert(messages).values({
    chatbotId,
    sessionId,
    response,
    message,
  });
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
      and(eq(messages.chatbotId, chatbotId), eq(messages.sessionId, sessionId))
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

export async function getCurrentPeriodMessagesCountByChatbotId({
  periodStart,
  periodEnd,
  chatbotId,
}: {
  periodStart: Date;
  periodEnd: Date;
  chatbotId: number;
}) {
  try {
    const [{ count: messagesCount }] = await db
      .select({
        count: count(),
      })
      .from(messages)
      .where(
        and(
          eq(messages.chatbotId, chatbotId),
          gte(messages.createdAt, periodStart),
          lte(messages.createdAt, periodEnd)
        )
      );

    return messagesCount;
  } catch (error) {
    console.error(error);
  }
}

export async function getCurrentPeriodMessagesPerDayByClerkId({
  clerkId,
}: {
  clerkId: string;
}) {
  try {
    const sub = await getSubscriptionByClerkId({ clerkId });
    const chatbots = await getChatbotsByClerkId({ clerkId });

    if (!sub) throw new Error("No subscription found");
    if (chatbots.length === 0) return [];

    const chatbotIds = chatbots.map((bot) => bot.id);

    const rows = await db
      .select({
        date: sql<string>`to_char(date_trunc('day', ${messages.createdAt}), 'YYYY-MM-DD')`,
        messages: sql<number>`COUNT(*)`,
      })
      .from(messages)
      .where(
        and(
          inArray(messages.chatbotId, chatbotIds),
          between(messages.createdAt, sub.periodStart, sub.periodEnd)
        )
      )
      .groupBy(sql`date_trunc('day', ${messages.createdAt})`)
      .orderBy(sql`date_trunc('day', ${messages.createdAt}) ASC`);

    return rows.map((row) => ({
      date: new Date(row.date + "T00:00:00Z").toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
      messages: row.messages,
    }));
  } catch (error) {
    console.error(
      "Error on getCurrentPeriodMessagesPerDayByClerkId --> ",
      error
    );
    return [];
  }
}
