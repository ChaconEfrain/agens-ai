import { db } from ".";
import { chatbots } from "./schema";
import { eq } from "drizzle-orm";

export async function getChatbotBySlug({ slug }: { slug: string }) {
  const chatbot = await db.query.chatbots.findFirst({
    where: eq(chatbots.slug, slug),
    with: {
      business: true,
      files: true,
    },
  });

  if (!chatbot) throw new Error("Chatbot not found");

  return chatbot;
}
