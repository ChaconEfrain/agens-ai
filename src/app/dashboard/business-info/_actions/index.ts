'use server'

import { FormWizardData } from "@/app/create-chatbot/_components/form-wizard";
import { ALLOWED_PDF } from "@/consts/subscription";
import { updateBusiness } from "@/db/business";
import { updateChatbotPdfTokens } from "@/db/chatbot";
import { saveEmbeddings, updateChatbotEmbeddings } from "@/db/embeddings";
import { createFile } from "@/db/files";
import { getSubscriptionByUserId } from "@/db/subscriptions";
import { updateBusinessAndEmbeddingsTransaction } from "@/db/transactions";
import { getUserByClerkId } from "@/db/user";
import { normalizeFormChunks } from "@/lib/utils";
import { getCoherentChunksFromPdf } from "@/services/openai";
import { utapi } from "@/services/uploadthing";
import { extractTextFromPdf } from "@/services/utils";
import { auth } from "@clerk/nextjs/server";
import { UploadFileResult } from "uploadthing/types";

export async function updateBusinessAction({form, businessId}: {form: FormWizardData, businessId: number}) {
  const chunks = normalizeFormChunks(form);
  let result: UploadFileResult[] = [];

  try {
    const { userId } = await auth();
    
    if (!userId) throw new Error("No session detected");

    const user = await getUserByClerkId({ clerkId: userId });
    const sub = await getSubscriptionByUserId({ userId: user.id });
    const chatbot = user.chatbots.find(bot => bot.businessId === businessId);

    if (!chatbot) throw new Error("No chatbot found for this business");

    if (form.documents && form.documents.length > 0) {
      if (
        (sub?.plan === "free" &&
          form.documents.length + user.files.length >
            ALLOWED_PDF[sub.plan.toUpperCase() as "FREE"]) ||
        (sub?.plan === "basic" &&
          form.documents.length + user.files.length >
            ALLOWED_PDF[sub.plan.toUpperCase() as "BASIC"])
      ) {
        return {
          success: false,
          message: `Your current subscription plan only allows ${ALLOWED_PDF[sub.plan.toUpperCase() as "FREE" | "BASIC"]} PDF upload`,
        };
      }
      result = await utapi.uploadFiles(form.documents);
      const filesResult = result.map(({ data }) => ({
        userId: user.id,
        businessId,
        chatbotId: chatbot.id,
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
            pdfInputTokens: chatbot.pdfInputTokens + inputTokens,
            pdfOutputTokens: chatbot.pdfOutputTokens + outputTokens,
            chatbotId: chatbot.id,
          });
          await saveEmbeddings({ chunks, chatbotId: chatbot.id });
        }),
      ]);
    }

    await updateBusinessAndEmbeddingsTransaction({chatbotId: chatbot.id, form, businessId, chunks});

    return { success: true, message: "Business updated successfully" };
  } catch (error) {
    console.error("Error in updateBusinessAction --> ", error);
    return { success: false, message: 'Something went wrong, please try again' };
  }
}