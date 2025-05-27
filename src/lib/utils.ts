import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function chunkText(text: string, maxTokens = 200) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).split(/\s+/).length > maxTokens) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += " " + sentence;
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());

  return chunks;
}