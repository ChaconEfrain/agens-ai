'use server'

import { getRelatedEmbeddings } from "@/db/embeddings";
import { createMessages, disableMessagesByChatbotId, getLatestMessagesByChatbotId } from "@/db/messages";
import { chatCompletions, createEmbeddings } from "@/services/openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export async function sendMessageAction({
  message,
  chatbotId,
  chatbotInstructions,
  sessionId,
}: {
  message: string;
  chatbotId: number;
  chatbotInstructions: string;
  sessionId: string;
}) {
  try {
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

    return answer;
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