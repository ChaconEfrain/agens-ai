'use server'

import { ChatbotStyles } from "@/types/embedded-chatbot";
import { updateChatbotStyles } from "@/db/chatbot";

export async function updateStylesAction({
  styles,
  slug,
}: {
  styles: ChatbotStyles;
  slug: string;
}) {
  try {
    await updateChatbotStyles({
      slug,
      styles,
    });

    return { success: true, message: "Styles updated successfully" };
  } catch (error) {
    console.error("Error updating styles:", error);
    return {
      success: false,
      message: "Failed to update styles. Please try again",
    };
  }
}