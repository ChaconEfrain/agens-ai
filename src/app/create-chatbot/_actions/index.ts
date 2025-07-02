'use server'

import { FormWizardData } from "../_components/form-wizard";
import { utapi } from "@/app/api/uploadthing/core";
import type { UploadFileResult } from "uploadthing/types";
import { createChatbotTransaction } from "@/db/transactions";
import { UploadThingError } from "uploadthing/server";
import {
  deleteWizardProgress,
  loadWizardProgress,
  saveWizardProgress,
} from "@/db/form-wizard-progress";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/db/user";

export async function processDataAction(form: FormWizardData) {
  const chunks = normalizeFormChunks(form);

  const instructions = `You are a helpful and knowledgeable AI assistant for the business "${form.generalInfo.businessName}".

  Your tone should be friendly, your communication style concise and straight to the point, and your personality must be a helpful AI assistant expert on the business' area of expertise. Your main goal is to assist users in finding the information they need and answering their questions accurately.

  Rules:
  - Answer the questions in first person, as if you were the business' AI assistant.
  - Always answer in the same language as the user's main question.
  - Keep your output tokens in a range of 20 to 50 as long as it makes sense to do so.
  - Don't offer to help with purchases, refunds, or any other financial transactions, you are only here to answer questions about the business.
  - If the user asks about a product or service, provide information based on the provided data, but do not engage in sales or financial discussions.
  - If the user asks anything related to the mentioned above, advise them to contact customer support via the provided channels if not undefined: email: ${form.customerService.email}, phone: ${form.customerService.phone}, WhatsApp: ${form.customerService.whatsapp}.
  - If the user asks something that's not in your context but it's related to the business' subject go ahead and answer.
  - If the user asks something that is not related to the business, politely inform them that you can only assist with questions related to the business or the business' area of specialty.
  - Be respectful, concise, and efficient in all your responses, only providing the information requested.
  - Do not offer any kind of help or assistance at the end of your responses, just answer the question.
  - Never explain your reasoning or thought process, just provide the direct answer.
  - The user knows that you are an AI assistant for ${form.generalInfo.businessName}, so do not mention it or the business name in your responses.
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
      cause: null,
      slug: uniqueSlug,
    };
  } catch (error) {
    console.error("processDataAction error --> ", error);
    if (error instanceof UploadThingError) {
      return {
        success: false,
        message: "File upload failed",
        cause: error.cause,
        slug: uniqueSlug,
      };
    } else if (error instanceof Error && error.cause === "chatbot limit") {
      return {
        success: false,
        message: "Chatbot limit reached for your plan.",
        cause: error.cause,
        slug: uniqueSlug,
      };
    } else if (error instanceof Error) {
      return {
        success: false,
        message: "Something went wrong, please try again.",
        cause: error.cause,
        slug: uniqueSlug,
      };
    }
    return {
      success: false,
      message: "Something went wrong, please try again.",
      cause: null,
      slug: uniqueSlug,
    };
  }
}

export async function saveWizardProgressAction({
  data,
  step,
  wizardId,
}: {
  step: number;
  data: Partial<FormWizardData>;
  wizardId: string;
}) {
  try {
    const { userId } = await auth();

    if (!userId) throw new Error("No session detected");

    const user = await getUserByClerkId({ clerkId: userId });
    const [newProgress] = await saveWizardProgress({
      data,
      step,
      userId: user.id,
      wizardId,
    });
    return { success: true, message: "Progress saved correctly", newProgress };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Something went wrong saving your progress",
      newProgress: null,
    };
  }
}

export async function loadWizardProgressAction({
  wizardId,
}: {
  wizardId: string;
}) {
  try {
    const progress = await loadWizardProgress({ wizardId });

    return progress;
  } catch (error) {
    console.error(error);
  }
}

export async function deleteWizardProgressAction({
  wizardId,
}: {
  wizardId: string;
}) {
  try {
    await deleteWizardProgress({ wizardId });
  } catch (error) {
    console.error(error);
  }
}

function normalizeFormChunks(form: FormWizardData) {
  const chunks: string[] = [];

  // General Info
  const { businessName, description, allowedWebsites, foundedYear } =
    form.generalInfo;
  chunks.push(
    `The business is called ${businessName} and was founded in ${foundedYear}.`,
    allowedWebsites.length > 1
      ? `Its websites are ${allowedWebsites.map(({ url }) => url).join(", ")}.`
      : "Its website is " + allowedWebsites[0].url,
    description ? `Business description: ${description}` : ""
  );

  // Products & Services
  if (form.productsServices?.type === "products") {
    const items = form.productsServices.items ?? [];
    const itemDescriptions = items.map(
      (item: any) =>
        `Product: "${item.name}", Description: ${item.description}, Price: ${item.price}`
    );
    chunks.push(
      `The business offers the following products:\n${itemDescriptions.join(
        "\n"
      )}`
    );
  } else if (form.productsServices?.type === "services") {
    const items = form.productsServices.items ?? [];
    const itemDescriptions = items.map(
      (item: any) =>
        `Service: "${item.name}", Description: ${item.description}, Price: ${item.price}`
    );
    chunks.push(
      `The business offers the following services:\n${itemDescriptions.join(
        "\n"
      )}`
    );
  }

  // Shipping
  if (form.hasPhysicalProducts) {
    const logistics = form.shippingLogistics;
    if (logistics) {
      const details = Object.entries(logistics)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
      chunks.push(`Shipping logistics details: ${details}`);
    }
  }

  // Customer Service
  const cs = form.customerService;
  if (cs) {
    chunks.push(
      `Customer support is available ${cs.supportHours}.`,
      `Contact methods: ${cs.contactMethods}.`,
      cs.email ? `Email: ${cs.email}` : "",
      cs.phone ? `Phone: ${cs.phone}` : "",
      cs.whatsapp ? `WhatsApp: ${cs.whatsapp}` : "",
      cs.socialMedia ? `Social media: ${cs.socialMedia}` : "",
      `Typical response time: ${cs.responseTime}`
    );

    const faq = cs.commonQuestions ?? [];
    for (const { question, answer } of faq) {
      chunks.push(`Customer FAQ - Q: "${question}" A: "${answer}"`);
    }
  }

  return chunks.filter(Boolean); // removes empty strings
}
