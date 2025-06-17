'use server'

import { utapi } from "@/app/api/uploadthing/core";
import { saveEmbeddings } from "@/db/embeddings";
import { createFile } from "@/db/files";
import { extractTextFromPdf } from "@/services/utils";
import { chunkText } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/db/user";

export async function updateChatbotFilesAction({
  files,
  chatbotId,
  businessId,
}: {
  files: File[];
  chatbotId: number;
  businessId: number;
}) {
  const { userId } = await auth();

  if (!userId) throw new Error("No session detected");

  const user = await getUserByClerkId({ clerkId: userId });
  const result = await utapi.uploadFiles(files);

  try {
    const filesResult = result.map(({ data }) => ({
      userId: user.id,
      businessId,
      chatbotId,
      fileUrl: data?.ufsUrl ?? "",
      title: data?.name ?? "",
    }));
    await createFile({ filesResult });

    await Promise.all(
      result.map(async ({ data }) => {
        if (!data) return;

        const fullText = await extractTextFromPdf({ fileUrl: data.ufsUrl });
        const chunks = chunkText(fullText);
        const embeddings = await saveEmbeddings({ chunks, chatbotId });

        if (!embeddings) throw new Error("embedding");
      })
    );
    return {
      success: true,
      message: "Chatbot context updated successfully",
    };
  } catch (error) {
    console.error("Error processing file:", error);
    let message = "Something went wrong";
    if (error instanceof Error) {
      if (error.message === "embedding") {
        message = "Something went wrong updating the chatbot context";
      } else if (error.message === "file") {
        message = "Something went wrong processing the file";
      }
    }
    return { success: false, message };
  }
}