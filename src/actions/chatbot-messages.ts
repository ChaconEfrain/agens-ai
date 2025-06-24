'use server'

import { getChatbotAllowedDomainsEmbed } from "@/db/chatbot-embed";
import { getRelatedEmbeddings } from "@/db/embeddings";
import {
  disableMessagesByChatbotId,
  getActiveMessagesByChatbotId,
  getAllMessagesCountByChatbotId,
  getLatestMessagesByChatbotId,
  updateMessageRating,
} from "@/db/messages";
import { chatCompletions, createEmbeddings } from "@/services/openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import jwt from "jsonwebtoken";
import { getSubscriptionByChatbotId } from "@/db/subscriptions";
import { ALLOWED_MESSAGE_QUANTITY } from "@/consts/subscription";
import { createMessageTransaction } from "@/db/transactions";
import { getChatbotTestMessageCount } from "@/db/chatbot";

const JWT_SECRET = process.env.JWT_SECRET!;
const IS_DEV = process.env.NODE_ENV === "development";

export async function sendMessageAction({
  message,
  chatbotId,
  chatbotInstructions,
  sessionId,
  token,
  pathname,
}: {
  message: string;
  chatbotId: number;
  chatbotInstructions: string;
  sessionId: string;
  token: string;
  pathname: string;
}) {
  let subscription;
  let testMessageCount;
  try {
    if (!IS_DEV && pathname.startsWith("/embed")) {
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
      subscription = await getSubscriptionByChatbotId({
        chatbotId,
      });

      const basicLimitReached =
        subscription?.plan === "basic" &&
        subscription?.messageCount >= ALLOWED_MESSAGE_QUANTITY.BASIC;
      const proLimitReached =
        subscription?.plan === "pro" &&
        subscription?.messageCount >= ALLOWED_MESSAGE_QUANTITY.PRO;

      if (!subscription || subscription.status === "canceled") {
        testMessageCount = await getChatbotTestMessageCount({ chatbotId });
        const totalMessages = await getAllMessagesCountByChatbotId({
          chatbotId,
        });

        if (totalMessages - testMessageCount >= ALLOWED_MESSAGE_QUANTITY.FREE) {
          return "limit reached";
        }
      } else if (basicLimitReached || proLimitReached) {
        return "limit reached";
      }
    }

    if (pathname.startsWith("/test-chatbot")) {
      testMessageCount = await getChatbotTestMessageCount({ chatbotId });
      if (testMessageCount >= ALLOWED_MESSAGE_QUANTITY.TEST) {
        return "limit reached";
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

    const historyMessages = latestMessages
      .map(({ response, message }) => [
        {
          role: "user",
          content: message,
        },
        {
          role: "assistant",
          content: response,
        },
      ])
      .flat();

    const context = contextChunks.map((c) => c.content).join("\n");

    const messages = [
      { role: "system", content: chatbotInstructions },
      ...historyMessages,
      { role: "user", content: `Context:\n${context}` },
      { role: "user", content: message },
    ] as ChatCompletionMessageParam[];

    const answer = await chatCompletions({ messages });

    if (!answer) return "error";

    const dbMessage = {
      chatbotId,
      sessionId,
      message,
      response: answer,
    };

    const messageInsert = await createMessageTransaction({
      message: dbMessage,
      messageCount: (subscription?.messageCount as number) + 1,
      stripeSubscriptionId: subscription?.stripeSubscriptionId,
      pathname,
      testMessageCount,
    });

    return messageInsert ?? "error";
  } catch (error) {
    console.error("Send message action error --> ", error);
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

export async function getChatbotTestMessageCountAction({
  chatbotId,
}: {
  chatbotId: number;
}) {
  try {
    const count = await getChatbotTestMessageCount({ chatbotId });
    return count;
  } catch (error) {
    console.error(error);
    return 0;
  }
}

export async function rateMessageAction({
  messageId,
  rating,
}: {
  messageId: number;
  rating: "like" | "dislike" | null;
}) {
  try {
    await updateMessageRating({ messageId, rating });
    return { success: true };
  } catch (error) {
    console.error("Error on rateMessageAction --> ", error);
    return { success: false };
  }
}