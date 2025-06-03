import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import DOMPurify from "dompurify";

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

export function sanitizeSvg(svgString: string) {
  return DOMPurify.sanitize(svgString, {
    USE_PROFILES: { svg: true },
    FORBID_TAGS: ["script", "style"],
    FORBID_ATTR: [
      "onerror",
      "onload",
      "onclick",
      "onmouseover",
      "xmlns:xlink",
      "xmlns",
      "xlink:href",
      "style",
    ],
  });
}