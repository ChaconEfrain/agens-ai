'use server'

import { getRelatedEmbeddings } from "@/db/embeddings";
import { chatCompletions, createEmbeddings } from "@/services/openai";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export async function sendMessageAction({message, chatbotId, chatbotInstructions}: {
  message: string;
  chatbotId: number;
  chatbotInstructions: string;
}) {
  
  const [{embedding: userEmbedding}] = await createEmbeddings([message]);
    const contextChunks = await getRelatedEmbeddings({userEmbedding, chatbotId});
  
    const context = contextChunks.map((c) => c.content).join('\n');
  
    const messages = [
      { role: 'system', content: chatbotInstructions },
      { role: 'user', content: `Context:\n${context}` },
      { role: 'user', content: message },
    ] as ChatCompletionMessageParam[];

  const answer = await chatCompletions({messages})

  return answer;
}