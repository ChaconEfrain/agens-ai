import { Transaction } from "@/types/db-transaction";
import { db } from ".";
import { messages } from "./schema";
import { and, asc, desc, eq } from "drizzle-orm";

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
  const messagesList = await db
    .select()
    .from(messages)
    .where(eq(messages.chatbotId, chatbotId));

  return messagesList.length;
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
