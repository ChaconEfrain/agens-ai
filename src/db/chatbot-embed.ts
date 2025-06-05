import { eq } from "drizzle-orm";
import { db } from ".";
import { chatbots } from "./schema";

export async function getChatbotBySlugEmbed({ slug }: { slug: string }) {
  const chatbot = await db.query.chatbots.findFirst({
    where: eq(chatbots.slug, slug),
    with: {
      business: true,
      files: true,
    },
  });

  if (!chatbot) return null;

  return chatbot;
}

export async function getChatbotByIdEmbed({ id }: { id: number }) {
  const chatbot = await db.query.chatbots.findFirst({
    where: eq(chatbots.id, id),
  });

  if (!chatbot) return null;

  return chatbot;
}