'use server'

import { getUserByClerkId } from "@/db/user";
import { stripe } from "@/services/stripe";
import { currentUser } from "@clerk/nextjs/server";

const BASIC_PLAN_PRICE_ID = "price_1RXbblFPnR9XY3t8FfExdSsH";
const PRO_PLAN_PRICE_ID = "price_1RXbd9FPnR9XY3t8XZeogu8q";

export async function createStripeSessionAction({
  plan,
  fromPage,
  origin,
  customerId,
}: {
  plan: string;
  fromPage: string;
  origin: string;
  customerId?: string | null;
}) {
  try {
    const user = await currentUser();
    if (!user) return { message: "Please sign in to proceed" };
    const appUser = await getUserByClerkId({ clerkId: user?.id });

    if (!appUser) return { message: "Something went wrong, please try again" };

    const success = await stripe.checkout.sessions.create({
      customer: customerId ?? undefined,
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

export async function updateSubscriptionPlanAction({
  subscriptionId,
  newPlan,
}: {
  subscriptionId: string;
  newPlan: string;
}) {
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

export async function cancelSubscriptionAction({
  stripeSubscriptionId,
  subscriptionId,
  activeChatbot,
}: {
  stripeSubscriptionId: string;
  subscriptionId: string;
  activeChatbot?: string;
}) {
  try {
    const current = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at: current.items.data[0].current_period_end,
      metadata: {
        activeChatbot: activeChatbot ?? null,
        subscriptionId,
      },
    });

    return {
      success: true,
      message: "Your subscription is scheduled for cancelation at period end",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Something went wrong, please try again",
    };
  }
}

export async function revertCancelSubscriptionAction({
  stripeSubscriptionId,
  subscriptionId,
  activeChatbot,
}: {
  stripeSubscriptionId: string;
  subscriptionId: string;
  activeChatbot?: string;
}) {
  try {
    await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at: null,
      metadata: {
        activeChatbot: activeChatbot ?? null,
        subscriptionId,
      },
    });

    return {
      success: true,
      message: "Your subscription will no longer be canceled at period end",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Something went wrong, please try again",
    };
  }
}