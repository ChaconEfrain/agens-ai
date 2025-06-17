import { FormWizardData } from "@/app/create-chatbot/_components/form-wizard";
import { db } from ".";
import { businesses, User } from "./schema";
import { eq } from "drizzle-orm";
import { Transaction } from "@/types/db-transaction";

export async function createBusiness(
  { form, user }: { form: FormWizardData; user: User },
  trx: Transaction
) {
  return await trx
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
      internationalShipping: form.shippingLogistics?.internationalShipping,
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
      shippingRestrictions: form.shippingLogistics?.shippingRestrictions,
      socialMedia: form.customerService.socialMedia,
      supportHours: form.customerService.supportHours,
      allowedWebsites: form.generalInfo.allowedWebsites.map(({ url }) => url),
      whatsapp: form.customerService.whatsapp,
    })
    .returning({
      id: businesses.id,
      allowedDomains: businesses.allowedWebsites,
    });
}

export async function getBusinessByUserId({ userId }: { userId: number }) {
  const business = await db.query.businesses.findFirst({
    where: eq(businesses.userId, userId),
  });

  if (!business) throw new Error("Business not found");

  return business;
}
