import { STRIPE_WEBHOOK_EVENTS } from "@/consts/stripe";
import {
  deactivateChatbotsBySubscriptionId,
  toggleDeactivateChatbotAtPeriodEnd,
} from "@/db/chatbot";
import {
  cancelSubscription,
  createSubscription,
  updateSubscription,
} from "@/db/subscriptions";
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
      webhookSecret
    );

    if (event.type === STRIPE_WEBHOOK_EVENTS.CHECKOUT_SESSION_COMPLETED) {
      const session = event.data.object;

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      await createSubscription({
        periodEnd: new Date(
          subscription.items.data[0].current_period_end * 1000
        ),
        periodStart: new Date(
          subscription.items.data[0].current_period_start * 1000
        ),
        status: subscription.status as
          | "active"
          | "incomplete"
          | "incomplete_expired",
        plan: subscription.items.data[0].price.lookup_key as "basic" | "pro",
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        userId: Number(session.metadata?.userId),
      });

      return Response.json({ subscription, status: 200 });
    } else if (
      event.type === STRIPE_WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_UPDATED
    ) {
      const subscription = event.data.object;

      await updateSubscription({
        periodEnd: new Date(
          subscription.items.data[0].current_period_end * 1000
        ),
        periodStart: new Date(
          subscription.items.data[0].current_period_start * 1000
        ),
        status: subscription.status as
          | "active"
          | "incomplete"
          | "incomplete_expired",
        plan: subscription.items.data[0].price.lookup_key as "basic" | "pro",
        stripeSubscriptionId: subscription.id,
        cancelAtPeriodEnd: subscription.cancel_at ? true : false,
      });

      await toggleDeactivateChatbotAtPeriodEnd({
        activeChatbot: Number(subscription.metadata.activeChatbot ?? 0),
        deactivateAtPeriodEnd: subscription.cancel_at ? true : false,
        subscriptionId: Number(subscription.metadata.subscriptionId),
      });

      return Response.json({ subscription, status: 200 });
    } else if (
      event.type === STRIPE_WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_DELETED
    ) {
      const subscription = event.data.object;

      const [{ id }] = await cancelSubscription({
        status: subscription.status as "canceled",
        stripeSubscriptionId: subscription.id,
      });

      await deactivateChatbotsBySubscriptionId({ subscriptionId: id });

      return Response.json({ subscription, status: 200 });
    }

    return new Response("Event not handled", { status: 200 });
  } catch (error) {
    return Response.json({ error, status: 400 });
  }
}
