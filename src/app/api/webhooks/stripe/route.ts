import { STRIPE_WEBHOOK_EVENTS } from "@/consts/stripe";
import { updateSubscription } from "@/db/stripe";
import { createSubscriptionTransaction } from "@/db/transactions";
import { stripe } from "@/services/stripe";
import { headers } from "next/headers";
import type Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const sig = (await headers()).get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      sig as string,
      webhookSecret,
    );
  } catch (error) {
    return Response.json({
      error,
      status: 400,
    });
  }

  if (event.type === STRIPE_WEBHOOK_EVENTS.CHECKOUT_SESSION_COMPLETED) {
    const session = event.data.object;

    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

    await createSubscriptionTransaction({session, subscription});

    return Response.json({ subscription, status: 200 });
  } else if (event.type === STRIPE_WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_UPDATED) {
    const subscription = event.data.object;

    await updateSubscription({
      periodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
      periodStart: new Date(subscription.items.data[0].current_period_start * 1000),
      status: subscription.status as 'active' | 'canceled' | 'incomplete' | 'incomplete_expired',
      stripeSubscriptionId: subscription.id
    })

    return Response.json({ subscription, status: 200 });
  }

  return new Response("Event not handled", { status: 200 });
}
