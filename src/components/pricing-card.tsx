import React, {
  type ForwardRefExoticComponent,
  type RefAttributes,
} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Check, type LucideProps } from "lucide-react";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import SubscribeButton from "./subscribe-button";
import { Subscription } from "@/db/schema";

interface Props {
  plan: string;
  label: string;
  price: string;
  description: string;
  includes: string[];
  Icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
}

export default function PricingCard({
  Icon,
  description,
  includes,
  label,
  plan,
  price,
}: Props) {
  return (
    <Card
      className={cn("min-h-[500px] border-2", {
        "border-primary relative md:scale-105 shadow-lg overflow-hidden":
          plan === "Basic",
        "border-muted": plan !== "Basic",
      })}
    >
      {plan === "Basic" && (
        <div className="absolute top-6 -right-24 rotate-45 w-64">
          <Badge className="bg-primary text-primary-foreground w-full">
            Most Popular
          </Badge>
        </div>
      )}
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Icon
            className={cn("h-5 w-5", {
              "text-muted-foreground": plan === "Free",
              "text-primary": plan === "Basic",
              "text-amber-500": plan === "Pro",
            })}
          />
          <Badge
            variant={plan !== "Basic" ? "outline" : "default"}
            className={cn({
              "bg-amber-50 text-amber-700 border-amber-200": plan === "Pro",
            })}
          >
            {plan}
          </Badge>
        </div>
        <CardTitle className="text-2xl">
          <span>{label}</span>
        </CardTitle>
        <CardDescription>
          <p>{description}</p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <p className="text-3xl font-bold">{price}/month</p>
        </div>
        <ul className="space-y-3 text-sm">
          {includes.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="mt-auto flex flex-col">
        {plan === "Pro" && (
          <p className="self-start text-sm text-muted-foreground mb-4">
            *$1 per extra 1,000 messages
          </p>
        )}
        <SubscribeButton plan={plan} />
      </CardFooter>
    </Card>
  );
}
