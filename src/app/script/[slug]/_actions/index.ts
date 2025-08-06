'use server'

import { ChatbotStyles } from "@/types/embedded-chatbot";
import { UploadThingError } from "uploadthing/server";
import { utapi } from "@/services/uploadthing";
import { updateChatbotStyles } from "@/db/chatbot";

export async function updateStylesAction({
  styles,
  slug,
  imageFile,
}: {
  styles: ChatbotStyles;
  slug: string;
  imageFile?: File;
}) {
  try {
    let imageUrl;
    if (imageFile) {
      if (!imageFile.type.startsWith("image/")) {
        throw new UploadThingError("Only image type file is allowed");
      }
      if (imageFile.size > 1 * 1024 * 1024) {
        throw new UploadThingError("Image file must be under 1MB");
      }

      const { data } = await utapi.uploadFiles(imageFile);

      if (data) {
        imageUrl = data.ufsUrl;
      }
    }

    await updateChatbotStyles({
      slug,
      styles: {
        ...styles,
        button: {
          ...styles.button,
          icon: imageUrl ?? styles.button.icon,
        },
      },
    });

    return { success: true, message: "Styles updated successfully" };
  } catch (error) {
    console.error("Error updating styles:", error);
    if (error instanceof UploadThingError) {
      return {
        success: false,
        message: error.message,
      };
    }
    return {
      success: false,
      message: "Failed to update styles. Please try again",
    };
  }
}