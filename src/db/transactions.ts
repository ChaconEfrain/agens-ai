import { FormWizardData } from "@/app/create-chatbot/_components/form-wizard";
import { getUserByClerkId } from "./user";
import { auth } from "@clerk/nextjs/server";
import { db } from ".";
import type { UploadFileResult } from "uploadthing/types";
import { extractTextFromPdf } from "@/services/utils";
import { DEFAULT_STYLES } from "@/consts/chatbot";
import {
  getSubscriptionByUserId,
  updateSubscriptionMessageCount,
} from "./subscriptions";
import {
  createChatbot,
  updateChatbotCurrentMessageCount,
  updateChatbotPdfTokens,
  updateChatbotTestMessageCount,
} from "./chatbot";
import { createMessage } from "./messages";
import { createBusiness, updateBusiness } from "./business";
import { saveEmbeddings, updateChatbotEmbeddings } from "./embeddings";
import { createFile } from "./files";
import { MessageInsert } from "./schema";
import { ALLOWED_CHATBOTS } from "@/consts/subscription";
import { getCoherentChunksFromPdf } from "@/services/openai";

interface CreateChatbotTransactionParams {
  form: FormWizardData;
  instructions: string;
  slug: string;
  chunks: string[];
  filesResult: UploadFileResult[];
}

export async function createChatbotTransaction({
  form,
  instructions,
  slug,
  chunks,
  filesResult,
}: CreateChatbotTransactionParams) {
  const { userId } = await auth();

  if (!userId) throw new Error("No session detected");

  const user = await getUserByClerkId({ clerkId: userId });
  const sub = await getSubscriptionByUserId({ userId: user.id });

  if (!sub) throw new Error("No subscription found");

  const hasChatbotButNoSub =
    (sub.status === "unsubscribed" || sub.status === "canceled") &&
    user.chatbots.length >= ALLOWED_CHATBOTS.FREE;
  const hasSubButChatbotLimit =
    sub.status === "active" &&
    user.chatbots.length >=
      ALLOWED_CHATBOTS[sub.plan.toUpperCase() as "BASIC" | "PRO"];

  if (hasChatbotButNoSub || hasSubButChatbotLimit) {
    throw new Error("Chatbot limit reached", {
      cause: "chatbot limit",
    });
  }

  return await db.transaction(async (trx) => {
    const [businessInsert] = await createBusiness({ form, user }, trx);

    const allowedDomains = businessInsert.allowedDomains.map((url) =>
      new URL(url).hostname.replace(/^www\./, "")
    );

    const [chatbotInsert] = await createChatbot(
      {
        allowedDomains,
        businessId: businessInsert.id,
        instructions,
        slug,
        styles: DEFAULT_STYLES,
        userId: user.id,
        testMessagesCount: 0,
        currentPeriodMessagesCount: 0,
        subscriptionId: sub.id,
        pdfInputTokens: 0,
        pdfOutputTokens: 0,
      },
      trx
    );

    let files;
    if (filesResult.length > 0) {
      files = filesResult.map(({ data }) => ({
        userId: user.id,
        businessId: businessInsert.id,
        chatbotId: chatbotInsert.id,
        fileUrl: data?.ufsUrl ?? "",
        title: data?.name ?? "",
      }));
    }

    await Promise.all([
      saveEmbeddings({ chatbotId: chatbotInsert.id, chunks }, trx),
      files && createFile({ filesResult: files }, trx),
      ...(files
        ? filesResult.map(async ({ data }) => {
            if (!data) return;

            const fullText = await extractTextFromPdf({ fileUrl: data.ufsUrl });
            const { chunks, inputTokens, outputTokens } =
              await getCoherentChunksFromPdf({
                pdfText: fullText,
              });
            await updateChatbotPdfTokens(
              {
                pdfInputTokens: chatbotInsert.pdfInputTokens + inputTokens,
                pdfOutputTokens: chatbotInsert.pdfOutputTokens + outputTokens,
                chatbotId: chatbotInsert.id,
              },
              trx
            );
            await saveEmbeddings({ chatbotId: chatbotInsert.id, chunks }, trx);
          })
        : []),
    ]);
  });
}

interface MessagesTransactionProps {
  message: Omit<
    MessageInsert,
    "id" | "liked" | "createdAt" | "isActive" | "updatedAt"
  >;
  stripeSubscriptionId: string | null;
  messageCount: number | undefined;
  pathname: string;
  testMessageCount: number | undefined;
}

export async function createMessageTransaction({
  message,
  stripeSubscriptionId,
  messageCount,
  pathname,
  testMessageCount,
}: MessagesTransactionProps) {
  return await db.transaction(async (trx) => {
    const { chatbotId } = message;
    const [messageInsert] = await Promise.all(
      [
        createMessage(message, trx),
        !pathname.startsWith("/test-chatbot")
          ? updateChatbotCurrentMessageCount({ chatbotId }, trx)
          : undefined,
        pathname.startsWith("/test-chatbot") && testMessageCount != null
          ? updateChatbotTestMessageCount(
              { chatbotId, testMessagesCount: testMessageCount + 1 },
              trx
            )
          : undefined,
        stripeSubscriptionId &&
        messageCount &&
        !pathname.startsWith("/test-chatbot")
          ? updateSubscriptionMessageCount(
              { stripeSubscriptionId, messageCount },
              trx
            )
          : undefined,
      ].filter(Boolean)
    );

    return messageInsert?.[0];
  });
}

export async function updateBusinessAndEmbeddingsTransaction({chatbotId, form, businessId, chunks}: {chatbotId: number, form: FormWizardData, businessId: number, chunks: string[]}) {
  return await db.transaction(async (trx) => {
    await Promise.all([
      updateBusiness({ form, businessId }, trx),
      updateChatbotEmbeddings({ chatbotId, chunks }, trx)
    ])
  });
}
