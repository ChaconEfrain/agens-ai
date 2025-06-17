import { FormWizardData } from "@/app/create-chatbot/_components/form-wizard";
import { getUserByClerkId } from "./user";
import { auth } from "@clerk/nextjs/server";
import { db } from ".";
import type { UploadFileResult } from "uploadthing/types";
import { extractTextFromPdf } from "@/services/utils";
import { chunkText } from "@/lib/utils";
import { defaultStyles } from "@/consts/chatbot";
import {
  createSubscription,
  updateSubscriptionMessageCount,
} from "./subscriptions";
import {
  createChatbot,
  updateChatbotsSubscription,
  updateChatbotTestMessageCount,
} from "./chatbot";
import Stripe from "stripe";
import { createMessages } from "./messages";
import { createBusiness } from "./business";
import { saveEmbeddings } from "./embeddings";
import { createFile } from "./files";

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
        styles: defaultStyles,
        userId: user.id,
        testMessagesCount: 0,
      },
      trx
    );

    await saveEmbeddings({ chatbotId: chatbotInsert.id, chunks }, trx);

    if (filesResult.length > 0) {
      const files = filesResult.map(({ data }) => ({
        userId: user.id,
        businessId: businessInsert.id,
        chatbotId: chatbotInsert.id,
        fileUrl: data?.ufsUrl ?? "",
        title: data?.name ?? "",
      }));
      await createFile({ filesResult: files }, trx);
    }

    await Promise.all(
      filesResult.map(async ({ data }) => {
        if (!data) return;

        const fullText = await extractTextFromPdf({ fileUrl: data.ufsUrl });
        const chunks = chunkText(fullText);

        await saveEmbeddings({ chatbotId: chatbotInsert.id, chunks }, trx);
      })
    );
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
  messages: {
    chatbotId: number;
    sessionId: string;
    role: "user" | "assistant";
    message: string;
  }[];
  stripeSubscriptionId: string | undefined;
  messageCount: number | undefined;
  pathname: string;
  testMessageCount: number | undefined;
}

export async function createMessagesTransaction({
  messages,
  stripeSubscriptionId,
  messageCount,
  pathname,
  testMessageCount,
}: MessagesTransactionProps) {
  await db.transaction(async (trx) => {
    const [{ chatbotId }] = messages;
    await createMessages(messages, trx);

    if (pathname.startsWith("/test-chatbot") && testMessageCount != null) {
      await updateChatbotTestMessageCount(
        { chatbotId, testMessagesCount: testMessageCount + 2 },
        trx
      );
    }

    if (stripeSubscriptionId && messageCount) {
      await updateSubscriptionMessageCount(
        { stripeSubscriptionId, messageCount },
        trx
      );
    }
  });
}
