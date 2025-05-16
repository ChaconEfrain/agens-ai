import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "./user";
import { db } from ".";
import { chatbots } from "./schema";
import { eq } from "drizzle-orm";

export async function createChatbot({
  instructions,
  slug,
  businessId,
}: {
  instructions: string;
  slug: string;
  businessId: number;
}) {
  const { userId } = await auth();

  try {
    if (!userId) throw new Error("No session detected");

    const user = await getUserByClerkId({ clerkId: userId });

    return await db
      .insert(chatbots)
      .values({
        userId: user.id,
        businessId,
        instructions,
        slug,
      })
      .returning({ id: chatbots.id });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Chatbot", {
        cause: error.message,
      });
    }
  }
}

export async function getChatbotBySlug({ slug }: { slug: string }) {
  const chatbot = await db.query.chatbots.findFirst({
    where: eq(chatbots.slug, slug),
    with: {
      business: true,
    },
  });

  return chatbot;
}