import { formSchema } from "@/app/create-chatbot/_components/form-wizard";
import { z } from "zod";
import { db } from ".";
import { businesses, users } from "./schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { getUser } from "./user";

export async function createbusiness(businessInfo: z.infer<typeof formSchema>) {
  const {userId} = await auth()

  try {
    if (!userId) throw new Error('No session detected');
  
    const user = await getUser({clerkId: userId})

    return await db.insert(businesses).values({
      userId: user.id,
      chatbotObjective: businessInfo.chatbotConfig.objective,
      chatbotPersonality: businessInfo.chatbotConfig.personality,
      chatbotStyle: businessInfo.chatbotConfig.style,
      chatbotTone: businessInfo.chatbotConfig.tone,
      description: businessInfo.generalInfo.description,
      name: businessInfo.generalInfo.businessName,
      productsOrServices: businessInfo.productsServices.type,
      commonQuestions: businessInfo.customerService.commonQuestions?.map((q) => ({
        question: q.question || "",
        answer: q.answer || "",
      })) ?? [],
      contactMethods: businessInfo.customerService.contactMethods,
      deliveryTimeframes: businessInfo.shippingLogistics?.deliveryTimeframes,
      email: businessInfo.customerService.email,
      foundedYear: businessInfo.generalInfo.foundedYear,
      hasPhysicalProducts: businessInfo.hasPhysicalProducts,
      internationalShipping: businessInfo.shippingLogistics?.internationalShipping,
      items: businessInfo.productsServices.items?.map((item) => ({
        name: item.name || "",
        description: item.description || "",
        price: item.price || "",
      })) ?? [],
      phone: businessInfo.customerService.phone,
      responseTime: businessInfo.customerService.responseTime,
      returnPolicy: businessInfo.shippingLogistics?.returnPolicy,
      shippingMethods: businessInfo.shippingLogistics?.shippingMethods,
      shippingRestrictions: businessInfo.shippingLogistics?.shippingRestrictions,
      socialMedia: businessInfo.customerService.socialMedia,
      supportHours: businessInfo.customerService.supportHours,
      website: businessInfo.generalInfo.website,
      whatsapp: businessInfo.customerService.whatsapp
    }).returning({id: businesses.id});
  } catch (error) {
    if (error instanceof Error) {
      throw new Error('Business', {
        cause: error.message
      })
    }
  }
}

export async function getBusiness({userId}: {userId: number}) {
  const business = await db.query.businesses.findFirst({
    where: eq(businesses.userId, userId)
  })

  if (!business) throw new Error('Business not found');

  return business;
}