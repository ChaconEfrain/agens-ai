"use client";

import { SUBSCRIPTION_PLANS } from "@/consts/pricing";
import PricingCard from "./pricing-card";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getSubscriptionByClerkIdAction } from "@/actions/subscription";
import { Subscription } from "@/db/schema";

export default function Pricing() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [checkingSub, setCheckingSub] = useState(false);
  const [sub, setSub] = useState<Subscription>();

  useEffect(() => {
    (async () => {
      setCheckingSub(true);
      if (isSignedIn) {
        const sub = await getSubscriptionByClerkIdAction({ clerkId: user.id });
        if (sub) {
          setSub(sub);
        }
      }
      setCheckingSub(false);
    })();
  }, [isLoaded]);
  return (
    <div>
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-3xl font-bold mb-4">Simple, transparent pricing</h1>
        <p className="text-xl text-muted-foreground">
          Choose the perfect plan for your business needs. No hidden fees or
          surprises.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-auto w-full">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <PricingCard
            key={plan.plan}
            Icon={plan.Icon}
            description={plan.description}
            includes={plan.includes}
            label={plan.label}
            plan={plan.plan}
            price={plan.price}
            checkingSub={checkingSub}
            setSub={setSub}
            sub={sub}
          />
        ))}
      </div>
    </div>
  );
}
