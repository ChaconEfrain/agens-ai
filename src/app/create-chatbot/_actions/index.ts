'use server'

import { z } from "zod"
import { formSchema } from "../_components/form-wizard"
import { createbusiness } from "@/db/business"
import { createChatbot } from "@/db/chatbot";
import { saveEmbeddings } from "@/db/embeddings";

export async function processDataAction (form: z.infer<typeof formSchema>) {
  
  const chunks = normalizeFormChunks(form);

  const instructions = `You are a helpful and knowledgeable AI assistant for the business "${form.generalInfo.businessName}".

  Your tone should be ${form.chatbotConfig.tone}, your communication style ${form.chatbotConfig.style}, and your personality must reflect the following traits: ${form.chatbotConfig.personality}. Your main goal is: ${form.chatbotConfig.objective}.

  This configuration was provided by the business owner and must be followed at all times. In addition to that, you must always follow these rules:

  - Be respectful, concise, and efficient in all your responses.
  - Never explain your reasoning or thought process—just provide the direct answer.
  - If you cannot answer a question based on the context, suggest contacting customer support. 
  - If the context includes any contact methods (such as an email, phone number, or WhatsApp), include them in your suggestion. Otherwise, just suggest contacting support in general.`;

  const slug = form.generalInfo.businessName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  const randomId = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
  const uniqueSlug = `${slug}-${randomId}`;

  try {
    const businessInsert = await createbusiness(form);

    if (businessInsert) {
      const chatbotInsert = await createChatbot({
        instructions,
        businessId: businessInsert[0].id,
        slug: uniqueSlug
      })

      if (chatbotInsert) {
        await saveEmbeddings({chunks, chatbotId: chatbotInsert[0].id});
      }
    }

    return {success: true, message: 'Your chatbot was created successfully.'}
  } catch (error) {
    if (error instanceof Error) {
      const { message } = error;
      if (message === 'Business') {
        return {success: false, message: 'Something went wrong saving the business information.'}
      } else if (message === 'Chatbot' || message === 'Embeddings') {
        return {success: false, message: 'Something went wrong creating the chatbot.'}
      }
    }
    return {success: false, message: 'Something went wrong, please try again later.'}
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
