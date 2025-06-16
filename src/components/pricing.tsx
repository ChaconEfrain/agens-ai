"use client";

import { susbcriptionPlans } from "@/consts/pricing";
import PricingCard from "./pricing-card";
import { useEffect, useState } from "react";
import { Subscription } from "@/db/schema";
import { useUser } from "@clerk/nextjs";
import { checkExistingSubscriptionAction } from "@/actions/stripe";

export default function Pricing() {
  const [checkingSub, setCheckingSub] = useState(true);
  const [existingSub, setExistingSub] = useState<Subscription>();
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    (async () => {
      if (isLoaded && isSignedIn) {
        const existing = await checkExistingSubscriptionAction({
          clerkId: user.id,
        });

        if (existing) setExistingSub(existing);

        setCheckingSub(false);
      }
    })();
  }, [isLoaded]);
  return (
    <div>
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
        <p className="text-xl text-muted-foreground">
          Choose the perfect plan for your business needs. No hidden fees or
          surprises.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-auto w-full">
        {susbcriptionPlans.map((plan) => (
          <PricingCard
            key={plan.plan}
            Icon={plan.Icon}
            description={plan.description}
            includes={plan.includes}
            label={plan.label}
            plan={plan.plan}
            price={plan.price}
            existingSub={existingSub}
            checkingSub={checkingSub}
          />
        ))}
      </div>
    </div>
  );
}
