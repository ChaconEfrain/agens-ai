import { FormWizardData } from "@/app/create-chatbot/_components/form-wizard";
import { getUserByClerkId } from "./user";
import { auth } from "@clerk/nextjs/server";
import { db } from ".";
import type { UploadFileResult } from "uploadthing/types";
import { extractTextFromPdf } from "@/services/utils";
import { DEFAULT_STYLES } from "@/consts/chatbot";
import {
  createSubscription,
  getSubscriptionByUserId,
  updateSubscriptionMessageCount,
} from "./subscriptions";
import {
  createChatbot,
  updateChatbotCurrentMessageCount,
  updateChatbotPdfTokens,
  updateChatbotsSubscription,
  updateChatbotTestMessageCount,
} from "./chatbot";
import Stripe from "stripe";
import { createMessage } from "./messages";
import { createBusiness } from "./business";
import { saveEmbeddings } from "./embeddings";
import { createFile } from "./files";
import { Chatbot, MessageInsert, User } from "./schema";
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

  const user = (await getUserByClerkId(
    { clerkId: userId },
    {
      with: {
        chatbots: true,
      },
    }
  )) as User & { chatbots: Chatbot[] };
  const sub = await getSubscriptionByUserId({ userId: user.id });

  const hasChatbotButNoSub =
    !sub && user.chatbots.length >= ALLOWED_CHATBOTS.FREE;
  const hasSubButChatbotLimit =
    !!sub &&
    user.chatbots.length >=
      ALLOWED_CHATBOTS[sub.plan.toUpperCase() as "BASIC" | "PRO"];
  const hasChatbotAndCanceledSub =
    !!sub &&
    sub.status === "canceled" &&
    user.chatbots.length >= ALLOWED_CHATBOTS.FREE;

  if (hasChatbotButNoSub || hasSubButChatbotLimit || hasChatbotAndCanceledSub) {
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
        subscriptionId: sub?.id ?? null,
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

export async function createSubscriptionTransaction({
  subscription,
  session,
}: {
  subscription: Stripe.Response<Stripe.Subscription>;
  session: Stripe.Checkout.Session;
}) {
  await db.transaction(async (trx) => {
    const [{ id: subscriptionId }] = await createSubscription(
      {
        periodEnd: new Date(
          subscription.items.data[0].current_period_end * 1000
        ),
        periodStart: new Date(
          subscription.items.data[0].current_period_start * 1000
        ),
        plan: subscription.items.data[0].price.lookup_key as "basic" | "pro",
        status: subscription.status as
          | "active"
          | "canceled"
          | "incomplete"
          | "incomplete_expired",
        stripeCustomerId: subscription.customer as string,
        stripeSubscriptionId: subscription.id,
        stripeItemId: subscription.items.data[0].id,
        userId: Number(session.metadata?.userId),
      },
      trx
    );

    await updateChatbotsSubscription(
      { subscriptionId, userId: Number(session.metadata?.userId) },
      trx
    );
  });
}

interface MessagesTransactionProps {
  message: Omit<
    MessageInsert,
    "id" | "liked" | "createdAt" | "isActive" | "updatedAt"
  >;
  stripeSubscriptionId: string | undefined;
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
        stripeSubscriptionId && messageCount
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
