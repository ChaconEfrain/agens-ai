'use server'

import { getChatbotAllowedDomainsEmbed } from "@/db/chatbot-embed";
import { getRelatedEmbeddings } from "@/db/embeddings";
import {
  disableMessagesByChatbotId,
  getActiveMessagesByChatbotId,
  getLatestMessagesByChatbotId,
  updateMessageRating,
} from "@/db/messages";
import {
  chatCompletions,
  createEmbeddings,
  rewriteQuestionForEmbedding,
} from "@/services/openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import jwt from "jsonwebtoken";
import { getSubscriptionByChatbotId } from "@/db/subscriptions";
import { ALLOWED_MESSAGE_QUANTITY } from "@/consts/subscription";
import { createMessageTransaction } from "@/db/transactions";
import {
  deactivateChatbotsBySubscriptionId,
  getChatbotTestMessageCount,
} from "@/db/chatbot";
import { stripe } from "@/services/stripe";
import { EXTRA_MESSAGES_METER } from "@/consts/stripe";

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
  try {
    let testMessageCount;
    const subscription = await getSubscriptionByChatbotId({
      chatbotId,
    });
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

      const freeLimitReached =
        subscription.plan === "free" &&
        subscription.messageCount >= ALLOWED_MESSAGE_QUANTITY.FREE;
      const basicLimitReached =
        subscription.plan === "basic" &&
        subscription.messageCount >= ALLOWED_MESSAGE_QUANTITY.BASIC;

      if (freeLimitReached || basicLimitReached) {
        await deactivateChatbotsBySubscriptionId({
          subscriptionId: subscription.id,
        });
        return "limit reached";
      }
    }

    if (pathname.startsWith("/test-chatbot")) {
      testMessageCount = await getChatbotTestMessageCount({ chatbotId });
      if (testMessageCount >= ALLOWED_MESSAGE_QUANTITY.TEST) {
        return "limit reached";
      }
    }

    const latestMessages = await getLatestMessagesByChatbotId({
      chatbotId,
      sessionId,
    });
    const historyMessages = latestMessages
      .map(({ response, message }) => [
        {
          role: "user" as const,
          content: message,
        },
        {
          role: "assistant" as const,
          content: response,
        },
      ])
      .flat();

    const {
      rewritten,
      inputTokens: rewriteInputTokens,
      outputTokens: rewriteOutputTokens,
    } = await rewriteQuestionForEmbedding({
      historyMessages,
      userQuestion: message,
    });
    const [{ embedding: userEmbedding }] = await createEmbeddings([rewritten]);
    const contextChunks = await getRelatedEmbeddings({
      userEmbedding,
      chatbotId,
      limit: 5,
    });

    const messages = [
      { role: "system", content: chatbotInstructions },
      ...historyMessages,
      {
        role: "user",
        content: `Most relevant info:\n${contextChunks
          .map((chunk) => `- ${chunk.content}`)
          .join("\n")}`,
      },
      { role: "user", content: `Main question: ${rewritten}` },
    ] as ChatCompletionMessageParam[];

    const {
      content: answer,
      inputTokens,
      outputTokens,
    } = await chatCompletions({ messages });

    if (!answer) return "error";

    const dbMessage = {
      chatbotId,
      sessionId,
      message,
      response: answer,
      isTest: pathname.startsWith("/test-chatbot"),
      rewrittenMessage: rewritten,
      inputTokens,
      outputTokens,
      rewriteInputTokens: rewriteInputTokens,
      rewriteOutputTokens: rewriteOutputTokens,
      totalInputTokens: inputTokens + rewriteInputTokens,
      totalOutputTokens: outputTokens + rewriteOutputTokens,
    };

    const messageInsert = await createMessageTransaction({
      message: dbMessage,
      messageCount: subscription.messageCount + 1,
      stripeSubscriptionId: subscription?.stripeSubscriptionId,
      pathname,
      testMessageCount,
    });

    if (messageInsert) {
      const proLimitReached =
        subscription.plan === "pro" &&
        subscription.messageCount >= ALLOWED_MESSAGE_QUANTITY.PRO;

      if (proLimitReached) {
        await stripe.billing.meterEvents.create({
          event_name: EXTRA_MESSAGES_METER,
          payload: {
            value: "0.001",
            stripe_customer_id: subscription.stripeCustomerId as string,
          },
        });
      }
    }

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