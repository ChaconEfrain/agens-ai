'use server'

import { getChatbotAllowedDomainsEmbed } from "@/db/chatbot-embed";
import { getRelatedEmbeddings } from "@/db/embeddings";
import {
  createMessages,
  disableMessagesByChatbotId,
  getActiveMessagesByChatbotId,
  getLatestMessagesByChatbotId,
} from "@/db/messages";
import { chatCompletions, createEmbeddings } from "@/services/openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const IS_DEV = process.env.NODE_ENV === "development";

export async function sendMessageAction({
  message,
  chatbotId,
  chatbotInstructions,
  sessionId,
  token,
}: {
  message: string;
  chatbotId: number;
  chatbotInstructions: string;
  sessionId: string;
  token: string;
}) {
  try {
    if (!IS_DEV) {
      const { domain } = jwt.verify(token, JWT_SECRET) as {
        chatbotId: number;
        domain: string;
        slug: string;
      };
      const allowedDomains = await getChatbotAllowedDomainsEmbed({
        id: chatbotId,
      });

      if (!allowedDomains.includes(domain)) {
        throw new Error(`Access from domain '${domain}' is not allowed`);
      }
    }

    const [{ embedding: userEmbedding }] = await createEmbeddings([message]);
    const contextChunks = await getRelatedEmbeddings({
      userEmbedding,
      chatbotId,
    });

    const latestMessages = await getLatestMessagesByChatbotId({
      chatbotId,
      sessionId,
    });

    const historyMessages = latestMessages.map(({ role, message }) => ({
      role,
      content: message,
    }));

    const context = contextChunks.map((c) => c.content).join("\n");

    const messages = [
      { role: "system", content: chatbotInstructions },
      ...historyMessages,
      { role: "user", content: `Context:\n${context}` },
      { role: "user", content: message },
    ] as ChatCompletionMessageParam[];

    const answer = await chatCompletions({ messages });

    await createMessages([
      {
        chatbotId,
        sessionId,
        role: "user",
        message,
      },
      {
        chatbotId,
        sessionId,
        role: "assistant",
        message: answer ?? "",
      },
    ]);

    return answer ?? "error";
  } catch (error) {
    console.error(error);
    return "error";
  }
}

export async function deleteMessagesAction({
  chatbotId,
  sessionId,
}: {
  chatbotId: number;
  sessionId: string;
}) {
  try {
    await disableMessagesByChatbotId({ chatbotId, sessionId });
    return {
      success: true,
      message: "Chatbot messages deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting messages:", error);
    return {
      success: false,
      message: "Error deleting messages",
    };
  }
}

export async function getActiveMessagesAction({
  chatbotId,
  sessionId,
}: {
  chatbotId: number;
  sessionId: string;
}) {
  try {
    const messages = await getActiveMessagesByChatbotId({
      chatbotId,
      sessionId,
    });
    return messages;
  } catch (error) {
    console.error("Error fetching active messages:", error);
    return [];
  }
}