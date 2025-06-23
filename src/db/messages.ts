import { Transaction } from "@/types/db-types";
import { db } from ".";
import { messages } from "./schema";
import { and, asc, count, desc, eq, gte, lte } from "drizzle-orm";

export async function createMessages(
  messagesArr: {
    chatbotId: number;
    sessionId: string;
    role: "user" | "assistant";
    message: string;
  }[],
  trx: Transaction
) {
  await trx.insert(messages).values(
    messagesArr.map(({ chatbotId, role, message, sessionId }) => ({
      chatbotId,
      sessionId,
      role,
      message,
    }))
  );
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

export async function getCurrentPeriodMessagesCount({
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
