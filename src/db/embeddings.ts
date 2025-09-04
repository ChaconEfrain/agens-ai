import { createEmbeddings } from "@/services/openai";
import { db } from ".";
import { embeddings } from "./schema";
import { cosineDistance, eq, and, isNull } from "drizzle-orm";
import { Transaction } from "@/types/db-types";

export async function saveEmbeddings(
  {
    chunks,
    chatbotId,
  }: {
    chunks: string[];
    chatbotId: number;
  },
  trx?: Transaction
) {
  try {
    const openAIEmbeddings = await createEmbeddings(chunks);
    const database = trx ?? db;

    await database.insert(embeddings).values(
      openAIEmbeddings.map(({ content, embedding }) => ({
        content,
        embedding,
        chatbotId,
      }))
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Embeddings", {
        cause: error.message,
      });
    }
  }
}

export async function getRelatedEmbeddings({
  userEmbedding,
  chatbotId,
  limit = 5,
}: {
  userEmbedding: number[];
  chatbotId: number;
  limit?: number;
}) {
  const contextChunks = await db
    .select({
      content: embeddings.content,
    })
    .from(embeddings)
    .where(eq(embeddings.chatbotId, chatbotId))
    .orderBy(cosineDistance(embeddings.embedding, userEmbedding))
    .limit(limit);

  return contextChunks;
}

export async function updateChatbotEmbeddings(
  {
    chunks,
    chatbotId,
  }: {
    chunks: string[];
    chatbotId: number;
  },
  trx?: Transaction
) {
  try {
    const database = trx ?? db;

    await Promise.all([
      database
      .delete(embeddings)
      .where(
        and(
        eq(embeddings.chatbotId, chatbotId),
        isNull(embeddings.fileId)
        )
      ),
      saveEmbeddings({ chatbotId, chunks }, trx)
    ]);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("UpdateChatbotEmbeddings", {
        cause: error.message,
      });
    }
  }
}