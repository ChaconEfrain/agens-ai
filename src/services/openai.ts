import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";

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

export async function chatCompletions({
  messages,
}: {
  messages: ChatCompletionMessageParam[];
}) {
  const result = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages,
  });
  
  return result.choices[0].message.content
}
