'use server'

import { getSubscriptionByClerkId } from "@/db/subscriptions"

export async function getSubscriptionByClerkIdAction({clerkId}: {clerkId: string}) {
  try {
    const sub = await getSubscriptionByClerkId({clerkId});
    return sub;
  } catch (error) {
    console.error("Error on getSubscriptionByClerkIdAction --> ", error);
  }
}