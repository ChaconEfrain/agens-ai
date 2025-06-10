'use server'

import { getUserByClerkId } from "@/db/user";
import { stripe } from "@/services/stripe"
import { currentUser } from "@clerk/nextjs/server";

const BASIC_PLAN_PRICE_ID = 'price_1RXbblFPnR9XY3t8FfExdSsH';
const PRO_PLAN_PRICE_ID = 'price_1RXbd9FPnR9XY3t8XZeogu8q';

export async function createStripeSessionAction({plan, fromPage, origin}: {plan: string, fromPage: string, origin: string}) {
  try {
    const user = await currentUser();
    if (!user) return {message: 'Please sign in to proceed'};
    const appUser = await getUserByClerkId({clerkId: user?.id})

    if (!appUser) return {message: 'Something went wrong, please try again'};

    const success = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: appUser.email,
      line_items: [
        {
          price: plan === 'Basic' ? BASIC_PLAN_PRICE_ID : PRO_PLAN_PRICE_ID,
          quantity: 1
        }
      ],
      metadata: {
        userId: appUser.id
      },
      success_url: `${origin}/dashboard`,
      cancel_url: fromPage,
    })

    const {url} = success;

    return {url}
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    return {
      message: 'Something went wrong, please try again'
    }
  }
}