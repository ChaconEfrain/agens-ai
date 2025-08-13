'use server'

import {
  deleteChatbotAndBusiness,
  getChatbotBySlug,
  toggleChatbotBySlug,
} from "@/db/chatbot";
import { revalidatePath } from "next/cache";

export async function deleteChatbotAndBusinessAction({
  businessId,
  path,
}: {
  businessId: number;
  path: string;
}) {
  try {
    await deleteChatbotAndBusiness({ businessId });

    revalidatePath(path);
    return { success: true, message: "Chatbot deleted succesfully" };
  } catch (error) {
    console.error("Error on deleteChatbotAction --> ", error);
    return {
      success: false,
      message: "Something went wrong deleting your chatbot",
    };
  }
}

export async function getChatbotBySlugAction({ slug }: { slug: string }) {
  try {
    const chatbot = await getChatbotBySlug({ slug });
    return chatbot;
  } catch (error) {
    console.error("Error on getChatbotBySlugAction --> ", error);
    return null;
  }
}

export async function toggleChatbotAction({
  slug,
  path,
}: {
  slug: string;
  path: string;
}) {
  try {
    await toggleChatbotBySlug({ slug });
    revalidatePath(path);
    return { success: true };
  } catch (error) {
    console.error("Error on toggleChatbotAction --> ", error);
    return {
      success: false,
    };
  }
}