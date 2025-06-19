"use client";

import { SUBSCRIPTION_PLANS } from "@/consts/pricing";
import PricingCard from "./pricing-card";

export default function Pricing() {
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
        {SUBSCRIPTION_PLANS.map((plan) => (
          <PricingCard
            key={plan.plan}
            Icon={plan.Icon}
            description={plan.description}
            includes={plan.includes}
            label={plan.label}
            plan={plan.plan}
            price={plan.price}
          />
        ))}
      </div>
    </div>
  );
}
