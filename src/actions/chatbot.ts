'use server'

import { deleteChatbotAndBusiness } from "@/db/chatbot";
import { revalidatePath } from "next/cache";

export async function deleteChatbotAndBusinessAction({
  businessId,
}: {
  businessId: number;
}) {
  try {
    await deleteChatbotAndBusiness({ businessId });

    revalidatePath("/create-chatbot");
    return { success: true, message: "Chatbot deleted succesfully" };
  } catch (error) {
    console.error("Error on deleteChatbotAction --> ", error);
    return {
      success: false,
      message: "Something went wrong deleting your chatbot",
    };
  }
}