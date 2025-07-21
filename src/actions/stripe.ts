'use server'

import { getSubscriptionByUserId } from "@/db/subscriptions";
import { getUserByClerkId } from "@/db/user";
import { stripe } from "@/services/stripe";
import { currentUser } from "@clerk/nextjs/server";

const BASIC_PLAN_PRICE_ID = "price_1RXbblFPnR9XY3t8FfExdSsH";
const PRO_PLAN_PRICE_ID = "price_1RXbd9FPnR9XY3t8XZeogu8q";

export async function createStripeSessionAction({
  plan,
  fromPage,
  origin,
}: {
  plan: string;
  fromPage: string;
  origin: string;
}) {
  try {
    const user = await currentUser();
    if (!user) return { message: "Please sign in to proceed" };
    const appUser = await getUserByClerkId({ clerkId: user?.id });

    if (!appUser) return { message: "Something went wrong, please try again" };

    const success = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: appUser.email,
      line_items: [
        {
          price: plan === "Basic" ? BASIC_PLAN_PRICE_ID : PRO_PLAN_PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: {
        userId: appUser.id,
      },
      success_url: `${origin}/dashboard`,
      cancel_url: fromPage,
    });

    const { url } = success;

    return { url };
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    return {
      message: "Something went wrong, please try again",
    };
  }
}

export async function checkExistingSubscriptionAction({
  clerkId,
}: {
  clerkId: string;
}) {
  try {
    const appUser = await getUserByClerkId({ clerkId });

    if (!appUser) return null;

    const existing = await getSubscriptionByUserId({ userId: appUser.id });

    return existing;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateSubscriptionAction({
  subscriptionId,
  newPlan,
}: {
  subscriptionId: string;
  subscriptionItemId: string;
  newPlan: string;
}) {
  console.log("newPlan --> ", newPlan);
  try {
    const current = await stripe.subscriptions.retrieve(subscriptionId);
    const newSub = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: current.items.data[0].id,
          deleted: true,
        },
        {
          price: newPlan === "pro" ? PRO_PLAN_PRICE_ID : BASIC_PLAN_PRICE_ID,
          quantity: 1,
        },
      ],
      proration_behavior: "create_prorations",
    });

    return {
      success: true,
      newSubPlan: newSub.items.data[0].price.lookup_key as "basic" | "pro",
      message: `Subscription ${
        newPlan === "pro" ? "upgraded" : "downgraded"
      } successfully`,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Something went wrong, please try again",
    };
  }
}