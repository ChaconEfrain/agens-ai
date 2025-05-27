import { formSchema } from "@/app/create-chatbot/_components/form-wizard";
import { z } from "zod";
import { businesses, chatbots, embeddings, files } from "./schema";
import { getUserByClerkId } from "./user";
import { auth } from "@clerk/nextjs/server";
import { db } from ".";
import { createEmbeddings } from "@/services/openai";
import type { UploadFileResult } from "uploadthing/types";
import { extractTextFromPdf } from "@/services/utils";
import { chunkText } from "@/lib/utils";

interface CreateChatbotTransactionParams {
  form: z.infer<typeof formSchema>;
  instructions: string;
  slug: string;
  chunks: string[];
  filesResult: UploadFileResult[];
}

export async function createChatbotTransaction({form, instructions, slug, chunks, filesResult}: CreateChatbotTransactionParams) {
  const { userId } = await auth();

  if (!userId) throw new Error("No session detected");

  const user = await getUserByClerkId({ clerkId: userId });

  return await db.transaction(async (tx) => {
    const businessInsert = await tx
    .insert(businesses)
    .values({
      userId: user.id,
      chatbotObjective: form.chatbotConfig.objective,
      chatbotPersonality: form.chatbotConfig.personality,
      chatbotStyle: form.chatbotConfig.style,
      chatbotTone: form.chatbotConfig.tone,
      description: form.generalInfo.description,
      name: form.generalInfo.businessName,
      productsOrServices: form.productsServices.type,
      commonQuestions:
        form.customerService.commonQuestions?.map((q) => ({
          question: q.question || "",
          answer: q.answer || "",
        })) ?? [],
      contactMethods: form.customerService.contactMethods,
      deliveryTimeframes: form.shippingLogistics?.deliveryTimeframes,
      email: form.customerService.email,
      foundedYear: form.generalInfo.foundedYear,
      hasPhysicalProducts: form.hasPhysicalProducts,
      internationalShipping:
        form.shippingLogistics?.internationalShipping,
      items:
        form.productsServices.items?.map((item) => ({
          name: item.name || "",
          description: item.description || "",
          price: item.price || "",
        })) ?? [],
      phone: form.customerService.phone,
      responseTime: form.customerService.responseTime,
      returnPolicy: form.shippingLogistics?.returnPolicy,
      shippingMethods: form.shippingLogistics?.shippingMethods,
      shippingRestrictions:
        form.shippingLogistics?.shippingRestrictions,
      socialMedia: form.customerService.socialMedia,
      supportHours: form.customerService.supportHours,
      website: form.generalInfo.website,
      whatsapp: form.customerService.whatsapp,
    })
    .returning({ id: businesses.id });

    if (!businessInsert) tx.rollback();

    const chatbotInsert = await tx
    .insert(chatbots)
    .values({
      userId: user.id,
      instructions,
      businessId: businessInsert[0].id,
      slug
    })
    .returning({ id: chatbots.id });

    if (!chatbotInsert) tx.rollback();

    const openAIFormEmbeddings = await createEmbeddings(chunks);

    const formEmbeddingsInsert = await tx
      .insert(embeddings)
      .values(
        openAIFormEmbeddings.map(({ content, embedding }) => ({
          content,
          embedding,
          chatbotId: chatbotInsert[0].id,
        }))
      )
      .returning({ id: embeddings.id });

    if (!formEmbeddingsInsert) tx.rollback();

    const filesInsert = await tx
      .insert(files)
      .values(
        filesResult.map(({ data }) => ({
          userId: user.id,
          businessId: businessInsert[0].id,
          chatbotId: chatbotInsert[0].id,
          fileUrl: data?.ufsUrl ?? "",
          title: data?.name ?? "",
        }))
      )
      .returning({ id: files.id });

    if (!filesInsert) tx.rollback();

    for (const { data } of filesResult) {
      if (!data) continue;

      const fullText = await extractTextFromPdf({ fileUrl: data.ufsUrl });
      const chunks = chunkText(fullText);
      const openAIFileEmbeddings = await createEmbeddings(chunks);

      const fileEmbeddingsInsert = await tx
        .insert(embeddings)
        .values(
          openAIFileEmbeddings.map(({ content, embedding }) => ({
            content,
            embedding,
            chatbotId: chatbotInsert[0].id,
          }))
        )
        .returning({ id: embeddings.id });

      if (!fileEmbeddingsInsert) tx.rollback();
    }
  });
}