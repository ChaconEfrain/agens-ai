'use server'

import { ChatbotStyles } from "@/types/embedded-chatbot";
import { updateChatbotStyles } from "@/db/chatbot";
import { sanitizeSvg } from "@/services/utils";

export async function updateStylesAction({styles, slug}: {styles: ChatbotStyles, slug: string}) {
  try {
    const sanitizedIcon = sanitizeSvg(styles.button.icon);

    await updateChatbotStyles({
      slug,
      styles: {
        ...styles,
        button: {
          ...styles.button,
          icon: sanitizedIcon,
        },
      },
    });

    return {success: true, message: "Styles updated successfully"};
  } catch (error) {
    console.error("Error updating styles:", error);
    return {success: false, message: 'Failed to update styles. Please try again'};
  }
}