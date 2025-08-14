import { eq } from "drizzle-orm";
import { db } from ".";
import { chatbots } from "./schema";

export async function getChatbotBySlugEmbed({ slug }: { slug: string }) {
  try {
    const chatbot = await db.query.chatbots.findFirst({
      where: eq(chatbots.slug, slug),
      with: {
        business: true,
        files: true,
        subscription: true,
      },
    });

    if (!chatbot) throw new Error("Chatbot not found");

    return chatbot;
  } catch (error) {
    console.error(error);
  }
}

export async function getChatbotByIdEmbed({ id }: { id: number }) {
  const chatbot = await db.query.chatbots.findFirst({
    where: eq(chatbots.id, id),
  });

  if (!chatbot) return null;

  return chatbot;
}

export async function getChatbotAllowedDomainsEmbed({ id }: { id: number }) {
  const chatbot = await db.query.chatbots.findFirst({
    where: eq(chatbots.id, id),
    columns: {
      allowedDomains: true,
    },
  });

  if (!chatbot) throw new Error("Error fetching allowed domains");

  return chatbot.allowedDomains;
}