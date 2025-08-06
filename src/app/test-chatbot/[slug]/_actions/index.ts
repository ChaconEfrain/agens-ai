'use server'

import { saveEmbeddings } from "@/db/embeddings";
import { createFile } from "@/db/files";
import { extractTextFromPdf } from "@/services/utils";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/db/user";
import { getCoherentChunksFromPdf } from "@/services/openai";
import { updateChatbotPdfTokens } from "@/db/chatbot";
import { utapi } from "@/services/uploadthing";

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

    await Promise.all([
      createFile({ filesResult }),
      ...result.map(async ({ data }) => {
        if (!data) return;

        const fullText = await extractTextFromPdf({ fileUrl: data.ufsUrl });
        const { chunks, inputTokens, outputTokens } =
          await getCoherentChunksFromPdf({ pdfText: fullText });
        await updateChatbotPdfTokens({
          pdfInputTokens: inputTokens,
          pdfOutputTokens: outputTokens,
          chatbotId,
        });
        await saveEmbeddings({ chunks, chatbotId });
      }),
    ]);
    return {
      success: true,
      message: "Chatbot context updated successfully",
    };
  } catch (error) {
    console.error("Error processing file:", error);
    let message = "Something went wrong updating the chatbot context";
    if (error instanceof Error && error.message === "file") {
      message = "Something went wrong processing the file";
    }
    return { success: false, message };
  }
}