import { auth } from "@clerk/nextjs/server";
import { getUser } from "./user";
import { getBusiness } from "./business";
import { db } from ".";
import { chatbots, users } from "./schema";
import { eq } from "drizzle-orm";

export async function createChatbot({instructions, slug, businessId}: {instructions: string; slug: string, businessId: number}) {
  const {userId} = await auth();

  try {
    if (!userId) throw new Error('No session detected');
  
    const user = await getUser({clerkId: userId})
  
    return await db.insert(chatbots).values({
      userId: user.id,
      businessId,
      instructions,
      slug
    }).returning({id: chatbots.id})
  } catch (error) {
    if (error instanceof Error) {
      throw new Error('Chatbot', {
        cause: error.message
      })
    }
  }
}

export async function getChatbot({userId}: {userId: number}) {
  const chatbot = await db.query.chatbots.findFirst({
    where: eq(chatbots.userId, userId)
  })

  if (!chatbot) throw new Error('Chatbot not found');

  return chatbot;
}