import { ChatbotStyles } from "@/types/embedded-chatbot";
import { db } from ".";
import { chatbots } from "./schema";
import { and, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "./user";
import { getBusinessByUserId } from "./business";
import { Transaction } from "@/types/db-transaction";

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

export async function updateChatbotStyles({
  slug,
  styles,
}: {
  slug: string;
  styles: ChatbotStyles;
}) {
  const { userId } = await auth();

  if (!userId) throw new Error("No session detected");

  const user = await getUserByClerkId({ clerkId: userId });

  if (!user) throw new Error("User not found");

  const business = await getBusinessByUserId({ userId: user.id });

  if (!business) throw new Error("Business not found");

  const [updatedStyles] = await db
    .update(chatbots)
    .set({ styles })
    .where(and(eq(chatbots.slug, slug), eq(chatbots.businessId, business.id)))
    .returning({ styles: chatbots.styles });

  return updatedStyles;
}

export async function updateChatbotsSubscription(
  {
    subscriptionId,
    userId,
  }: {
    subscriptionId: number;
    userId: number;
  },
  trx: Transaction
) {
  await trx
    .update(chatbots)
    .set({
      subscriptionId,
    })
    .where(eq(chatbots.userId, userId));
}
