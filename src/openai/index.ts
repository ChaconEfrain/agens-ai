import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function createEmbeddings(chunks: string[]) {
  const results = await Promise.all(
    chunks.map(async (content) => {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: content,
      });

      return {
        content,
        embedding: response.data[0].embedding,
      };
    })
  );

  return results;
}