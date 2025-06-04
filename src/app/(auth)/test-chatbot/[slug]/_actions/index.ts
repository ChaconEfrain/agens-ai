'use server'

import { utapi } from "@/app/api/uploadthing/core";
import { saveEmbeddings } from "@/db/embeddings";
import { createFile } from "@/db/files";
import { extractTextFromPdf } from "@/services/utils";
import { chunkText } from "@/lib/utils";

export async function updateChatbotFilesAction({
  files,
  chatbotId,
  businessId,
}: {
  files: File[];
  chatbotId: number;
  businessId: number;
}) {
  // TODO: Check auth and fields before proceeding
  const result = await utapi.uploadFiles(files);

  for (const { data } of result) {
    if (data) {
      try {
        const fileInsert = await createFile({
          fileUrl: data.ufsUrl,
          chatbotId,
          title: data.name,
          businessId,
        });
        if (!fileInsert) {
          throw new Error("file");
        }
        const fullText = await extractTextFromPdf({ fileUrl: data.ufsUrl });
        const chunks = chunkText(fullText);
        const embeddings = await saveEmbeddings({ chunks, chatbotId });

        if (!embeddings) throw new Error("embedding");
        //TODO: Revalidate /test-chatbot/[slug] path
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
  }
}