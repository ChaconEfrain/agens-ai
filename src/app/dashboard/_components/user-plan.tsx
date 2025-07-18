import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Subscription } from "@/db/schema";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import React from "react";
import PlanRenewDate from "./plan-renew-date";
import Link from "next/link";
import UserPlanMessages from "./user-plan-messages";

interface Props {
  clerkId: string;
  sub: Subscription;
}

export default function UserPlan({ sub, clerkId }: Props) {
  return (
    <section>
      <Card className="h-full relative gap-3">
        <Badge
          className={cn("absolute top-2 right-2", {
            "bg-green-50 text-green-700 border-green-200 ":
              sub.status === "active",
            "bg-yellow-50 text-yellow-700 border-yellow-200 ":
              sub.status === "incomplete",
            "bg-red-50 text-red-700 border-red-200 ": sub.status === "canceled",
          })}
        >
          {sub.status[0].toUpperCase() + sub.status.slice(1)}
        </Badge>
        <CardHeader>
          <CardTitle>
            <h2 className="text-2xl font-semibold">Current Plan</h2>
          </CardTitle>
          <CardDescription>
            <PlanRenewDate date={sub.periodEnd} />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <span className="text-5xl font-bold">
            {sub.plan[0].toUpperCase() + sub.plan.slice(1)}
          </span>
        </CardContent>
        <CardFooter className="flex mt-auto justify-between items-center">
          <UserPlanMessages clerkId={clerkId} sub={sub} />
          <Link
            href="/pricing"
            className="flex items-center gap-1 text-muted-foreground group self-end"
          >
            Manage{" "}
            <ArrowRight className="size-4 group-hover:translate-x-2 transition-transform duration-300" />
          </Link>
        </CardFooter>
      </Card>
    </section>
  );
}
