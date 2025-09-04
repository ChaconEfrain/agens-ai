import { FormWizardData } from "@/app/create-chatbot/_components/form-wizard";
import { businesses, User, users } from "./schema";
import { Transaction } from "@/types/db-types";
import { db } from ".";
import { eq } from "drizzle-orm";

export async function createBusiness(
  { form, user }: { form: FormWizardData; user: User },
  trx: Transaction
) {
  return await trx
    .insert(businesses)
    .values({
      userId: user.id,
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

export async function getBusinessByClerkId({ clerkId }: { clerkId: string }) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });

    if (!user) return null;

    const business = await db.query.businesses.findFirst({
      where: eq(businesses.userId, user.id),
    });

    return business;
  } catch (error) {
    console.error("Error on getBusinessByClerkId --> ", error);
    return null;
  }
}

export async function updateBusiness(
  { form, businessId }: { form: FormWizardData; businessId: number },
  trx?: Transaction
) {
  const database = trx ?? db;
  return await database
    .update(businesses)
    .set({
      name: form.generalInfo.businessName,
      description: form.generalInfo.description,
      allowedWebsites: form.generalInfo.allowedWebsites.map(({ url }) => url),
      foundedYear: form.generalInfo.foundedYear,
      productsOrServices: form.productsServices.type,
      items:
        form.productsServices.items?.map((item) => ({
          name: item.name || "",
          description: item.description || "",
          price: item.price || "",
        })) ?? [],
      hasPhysicalProducts: form.hasPhysicalProducts,
      shippingMethods: form.shippingLogistics?.shippingMethods,
      deliveryTimeframes: form.shippingLogistics?.deliveryTimeframes,
      returnPolicy: form.shippingLogistics?.returnPolicy,
      internationalShipping: form.shippingLogistics?.internationalShipping,
      shippingRestrictions: form.shippingLogistics?.shippingRestrictions,
      supportHours: form.customerService.supportHours,
      contactMethods: form.customerService.contactMethods,
      email: form.customerService.email,
      phone: form.customerService.phone,
      whatsapp: form.customerService.whatsapp,
      socialMedia: form.customerService.socialMedia,
      responseTime: form.customerService.responseTime,
      commonQuestions:
        form.customerService.commonQuestions?.map((q) => ({
          question: q.question || "",
          answer: q.answer || "",
        })) ?? [],
    })
    .where(eq(businesses.id, businessId))
    .returning({
      id: businesses.id,
    });
}
