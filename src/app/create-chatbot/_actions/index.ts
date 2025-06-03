'use server'

import { z } from "zod"
import { formSchema } from "../_components/form-wizard"
import { utapi } from "@/app/api/uploadthing/core";
import type { UploadFileResult } from "uploadthing/types";
import { createChatbotTransaction } from "@/db/transactions";
import { UploadThingError } from "uploadthing/server";

export async function processDataAction(form: z.infer<typeof formSchema>) {
  const chunks = normalizeFormChunks(form);

  //TODO: chatbot should answer in the same language as the user.
  const instructions = `You are a helpful and knowledgeable AI assistant for the business "${form.generalInfo.businessName}".

  Your tone should be ${form.chatbotConfig.tone}, your communication style ${form.chatbotConfig.style}, and your personality must reflect the following traits: ${form.chatbotConfig.personality}. Your main goal is: ${form.chatbotConfig.objective}.

  This configuration was provided by the business owner and must be followed at all times. In addition to that, you must always follow these rules:

  - Don't offer to help with purchases, refunds, or any other financial transactions, you are only here to answer questions about the business.
  - If the user asks about a product or service, provide information based on the provided data, but do not engage in sales or financial discussions.
  - If the user asks about shipping, provide the information based on the provided data, but do not engage in financial discussions.
  - If the user asks anything related to the mentioned above, advise them to contact customer support via the provided channels.
  - If the user asks something that is not related to the business, politely inform them that you can only assist with questions related to the business.
  - If the user asks for personal information, such as your name or location, politely decline to answer.
  - Be respectful, concise, and efficient in all your responses, only providing the information requested and nothing more.
  - Never explain your reasoning or thought process—just provide the direct answer.
  - If you cannot answer a question based on the context, suggest contacting customer support on these channels if not undefined: email: ${form.customerService.email}, phone: ${form.customerService.phone}, WhatsApp: ${form.customerService.whatsapp}.`;

  const slug = form.generalInfo.businessName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");
  const randomId = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0");
  const uniqueSlug = `${slug}-${randomId}`;
  let filesResult: UploadFileResult[] = [];

  try {
    if (form.documents) {
      filesResult = await utapi.uploadFiles(form.documents);
    }
    if (filesResult[0]?.error) {
      throw new UploadThingError({
        message: filesResult[0].error.message,
        code: filesResult[0].error.code,
      });
    }

    await createChatbotTransaction({
      form,
      instructions,
      slug: uniqueSlug,
      chunks,
      filesResult,
    });

    return {
      success: true,
      message: "Your chatbot was created successfully.",
      slug: uniqueSlug,
    };
  } catch (error) {
    console.error(error);
    if (error instanceof UploadThingError) {
      return {
        success: false,
        message: "File upload failed",
        slug: uniqueSlug,
      };
    }
    return {
      success: false,
      message: "Something went wrong, please try again.",
      slug: uniqueSlug,
    };
  }
}

function normalizeFormChunks(form: z.infer<typeof formSchema>) {
  const chunks: string[] = [];

  // General Info
  const { businessName, description, website, foundedYear } = form.generalInfo;
  chunks.push(
    `The business is called ${businessName} and was founded in ${foundedYear}.`,
    website ? `Its website is ${website}.` : '',
    description ? `Business description: ${description}` : ''
  );

  // Products & Services
  if (form.productsServices?.type === 'products') {
    const items = form.productsServices.items ?? [];
    const itemDescriptions = items.map(
      (item: any) =>
        `Product: "${item.name}", Description: ${item.description}, Price: ${item.price}`
    );
    chunks.push(
      `The business offers the following products:\n${itemDescriptions.join('\n')}`
    );
  } else if (form.productsServices?.type === 'services') {
    const items = form.productsServices.items ?? [];
    const itemDescriptions = items.map(
      (item: any) =>
        `Service: "${item.name}", Description: ${item.description}, Price: ${item.price}`
    );
    chunks.push(
      `The business offers the following services:\n${itemDescriptions.join('\n')}`
    );
  }

  // Shipping
  if (form.hasPhysicalProducts) {
    const logistics = form.shippingLogistics;
    if (logistics) {
      const details = Object.entries(logistics)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      chunks.push(`Shipping logistics details: ${details}`);
    }
  }

  // Customer Service
  const cs = form.customerService;
  if (cs) {
    chunks.push(
      `Customer support is available ${cs.supportHours}.`,
      `Contact methods: ${cs.contactMethods}.`,
      cs.email ? `Email: ${cs.email}` : '',
      cs.phone ? `Phone: ${cs.phone}` : '',
      cs.whatsapp ? `WhatsApp: ${cs.whatsapp}` : '',
      cs.socialMedia ? `Social media: ${cs.socialMedia}` : '',
      `Typical response time: ${cs.responseTime}`
    );

    const faq = cs.commonQuestions ?? [];
    for (const { question, answer } of faq) {
      chunks.push(`Customer FAQ - Q: "${question}" A: "${answer}"`);
    }
  }

  // Chatbot config
  const { objective, tone, style, personality } = form.chatbotConfig;
  chunks.push(
    `The chatbot's goal is: ${objective}.`,
    `Tone: ${tone}, Style: ${style}, Personality: ${personality}`
  );

  return chunks.filter(Boolean); // removes empty strings
}
