import { createEmbeddings } from "@/openai";
import { db } from ".";
import { embeddings } from "./schema";
import { auth } from "@clerk/nextjs/server";

export async function saveEmbeddings({chunks, chatbotId}: {chunks: string[], chatbotId: number}) {
  const {userId} = await auth()

  try {
    if (!userId) throw new Error('No session detected');
  
    const openAIEmbeddings = await createEmbeddings(chunks);
     
    return await db.insert(embeddings).values(
      openAIEmbeddings.map(({content, embedding}) => (
        {
          content,
          embedding,
          chatbotId
        }
      ))
    ).returning()
  } catch (error) {
    if (error instanceof Error) {
      throw new Error('Embeddings', {
        cause: error.message
      })
    }
  }
}