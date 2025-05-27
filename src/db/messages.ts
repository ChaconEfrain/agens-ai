import { auth } from "@clerk/nextjs/server";
import { db } from ".";
import { messages } from "./schema";
import { asc, desc, eq } from "drizzle-orm";

export async function createMessages(
  messagesArr: {
    chatbotId: number;
    role: "user" | "assistant";
    message: string;
  }[]
) {
  const user = await auth();

  if (!user) {
    throw new Error("No session detected");
  }

  await db.insert(messages).values(
    messagesArr.map(({ chatbotId, role, message }) => ({
      chatbotId,
      role,
      message,
    }))
  );
}

export async function getLatestMessagesByChatbotId({chatbotId, limit = 5}: { chatbotId: number; limit?: number }) {
  const latestMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.chatbotId, chatbotId))
    .orderBy(desc(messages.createdAt))
    .limit(limit);

  return latestMessages.reverse();
}

export async function getMessagesByChatbotId({ chatbotId }: { chatbotId: number }) {
  const messagesList = await db
    .select()
    .from(messages)
    .where(eq(messages.chatbotId, chatbotId))
    .orderBy(asc(messages.createdAt));

  return messagesList;
}