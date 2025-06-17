import { createEmbeddings } from "@/services/openai";
import { db } from ".";
import { embeddings } from "./schema";
import { cosineDistance, eq } from "drizzle-orm";
import { Transaction } from "@/types/db-transaction";

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

    return await database
      .insert(embeddings)
      .values(
        openAIEmbeddings.map(({ content, embedding }) => ({
          content,
          embedding,
          chatbotId,
        }))
      )
      .returning({ id: embeddings.id });
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
}: {
  userEmbedding: number[];
  chatbotId: number;
}) {
  const contextChunks = await db
    .select({
      content: embeddings.content,
    })
    .from(embeddings)
    .where(eq(embeddings.chatbotId, chatbotId))
    .orderBy(cosineDistance(embeddings.embedding, userEmbedding))
    .limit(5);

  return contextChunks;
}
