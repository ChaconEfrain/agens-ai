import { db } from ".";
import { businesses } from "./schema";
import { eq } from "drizzle-orm";

export async function getBusinessByUserId({ userId }: { userId: number }) {
  const business = await db.query.businesses.findFirst({
    where: eq(businesses.userId, userId),
  });

  if (!business) throw new Error("Business not found");

  return business;
}
