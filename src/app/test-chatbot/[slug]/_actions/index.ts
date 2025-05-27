'use server'

import { utapi } from "@/app/api/uploadthing/core";
import { getRelatedEmbeddings, saveEmbeddings } from "@/db/embeddings";
import { createFile } from "@/db/files";
import { extractTextFromPdf } from "@/services/utils";
import { chatCompletions, createEmbeddings } from "@/services/openai";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { chunkText } from "@/lib/utils";
import { createMessage, getLatestMessagesByChatbotId } from "@/db/messages";

export async function sendMessageAction({
  message,
  chatbotId,
  chatbotInstructions,
}: {
  message: string;
  chatbotId: number;
  chatbotInstructions: string;
}) {
  //TODO: Check auth and fields before proceding
  try {
    await createMessage({
      chatbotId,
      role: "user",
      message,
    });

    const [{ embedding: userEmbedding }] = await createEmbeddings([message]);
    const contextChunks = await getRelatedEmbeddings({
      userEmbedding,
      chatbotId,
    });

    const latestMessages = await getLatestMessagesByChatbotId({ chatbotId });

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

    await createMessage({
      chatbotId,
      role: "assistant",
      message: answer ?? "",
    });

    return answer;
  } catch (error) {
    console.error(error);
    return "error";
  }
}

export async function updateChatbotFilesAction({
  files,
  chatbotId,
  businessId,
}: {
  files: File[];
  chatbotId: number;
  businessId: number;
}) {
  // TODO: Check auth and fields before proceeding
  const result = await utapi.uploadFiles(files);

  for (const { data } of result) {
    if (data) {
      try {
        const fileInsert = await createFile({
          fileUrl: data.ufsUrl,
          chatbotId,
          title: data.name,
          businessId,
        });
        if (!fileInsert) {
          throw new Error("file");
        }
        const fullText = await extractTextFromPdf({ fileUrl: data.ufsUrl });
        const chunks = chunkText(fullText);
        const embeddings = await saveEmbeddings({ chunks, chatbotId });

        if (!embeddings) throw new Error("embedding");
        //TODO: Revalidate /test-chatbot/[slug] path
        return {
          success: true,
          message: "Chatbot context updated successfully",
        };
      } catch (error) {
        console.error("Error processing file:", error);
        let message = "Something went wrong";
        if (error instanceof Error) {
          if (error.message === "embedding") {
            message = "Something went wrong updating the chatbot context";
          } else if (error.message === "file") {
            message = "Something went wrong processing the file";
          }
        }
        return { success: false, message };
      }
    }
  }
}