export const STRIPE_WEBHOOK_EVENTS = {
  CHECKOUT_SESSION_COMPLETED: "checkout.session.completed",
  CUSTOMER_SUBSCRIPTION_UPDATED: "customer.subscription.updated",
  CUSTOMER_SUBSCRIPTION_DELETED: "customer.subscription.deleted",
} as const;

export const EXTRA_MESSAGES_METER = "extra_messages_meter";