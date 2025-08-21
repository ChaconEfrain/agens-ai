'use server'

import { saveEmbeddings } from "@/db/embeddings";
import { createFile } from "@/db/files";
import { extractTextFromPdf } from "@/services/utils";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/db/user";
import { getCoherentChunksFromPdf } from "@/services/openai";
import { updateChatbotPdfTokens } from "@/db/chatbot";
import { utapi } from "@/services/uploadthing";
import { getSubscriptionByUserId } from "@/db/subscriptions";
import { ALLOWED_PDF } from "@/consts/subscription";

export async function updateChatbotFilesAction({
  files,
  chatbotId,
  businessId,
}: {
  files: File[];
  chatbotId: number;
  businessId: number;
}) {
  try {
    const { userId } = await auth();

    if (!userId) throw new Error("No session detected");

    const user = await getUserByClerkId({ clerkId: userId });
    const sub = await getSubscriptionByUserId({ userId: user.id });

    if (
      (sub?.plan === "free" &&
        files.length + user.files.length >
          ALLOWED_PDF[sub.plan.toUpperCase() as "FREE"]) ||
      (sub?.plan === "basic" &&
        files.length + user.files.length >
          ALLOWED_PDF[sub.plan.toUpperCase() as "BASIC"])
    ) {
      return {
        success: false,
        message: `Your current subscription plan only allows ${ALLOWED_PDF[sub.plan.toUpperCase() as "FREE" | "BASIC"]} PDF upload`,
      };
    }

    const result = await utapi.uploadFiles(files);
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