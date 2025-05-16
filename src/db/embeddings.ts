import { createEmbeddings } from "@/services/openai";
import { db } from ".";
import { embeddings } from "./schema";
import { auth } from "@clerk/nextjs/server";
import { cosineDistance, eq } from "drizzle-orm";

export async function saveEmbeddings({
  chunks,
  chatbotId,
}: {
  chunks: string[];
  chatbotId: number;
}) {
  const { userId } = await auth();

  try {
    if (!userId) throw new Error("No session detected");

    const openAIEmbeddings = await createEmbeddings(chunks);

    return await db
      .insert(embeddings)
      .values(
        openAIEmbeddings.map(({ content, embedding }) => ({
          content,
          embedding,
          chatbotId,
        }))
      )
      .returning();
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
