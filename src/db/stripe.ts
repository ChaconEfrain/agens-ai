import { eq } from "drizzle-orm";
import { db } from ".";
import { SubscriptionInsert, subscriptions } from "./schema";
import { Transaction } from "@/types/db-transaction";

export async function createSubscription(
  {
    periodEnd,
    periodStart,
    plan,
    status,
    stripeCustomerId,
    stripeSubscriptionId,
    userId,
  }: SubscriptionInsert,
  trx: Transaction
) {
  const subscription = await trx
    .insert(subscriptions)
    .values({
      periodEnd,
      periodStart,
      plan,
      status,
      stripeCustomerId,
      stripeSubscriptionId,
      userId,
    })
    .returning({ id: subscriptions.id });

  return subscription;
}

export async function updateSubscription({
  periodStart,
  periodEnd,
  status,
  stripeSubscriptionId,
}: Pick<
  SubscriptionInsert,
  "periodEnd" | "periodStart" | "status" | "stripeSubscriptionId"
>) {
  await db
    .update(subscriptions)
    .set({
      periodStart,
      periodEnd,
      status,
    })
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));
}
