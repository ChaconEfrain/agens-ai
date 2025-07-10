import { Badge } from '@/components/ui/badge';
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ALLOWED_MESSAGE_QUANTITY } from "@/consts/subscription";
import { Subscription } from "@/db/schema";
import { cn } from "@/lib/utils";
import { Info, Slash } from "lucide-react";
import React from "react";

export default async function UserPlan({ sub }: { sub: Subscription }) {
  return (
    <>
      <section>
        <Card className="h-full relative">
          <Badge
            className={cn("absolute top-2 right-2", {
              "bg-green-50 text-green-700 border-green-200 ":
                sub.status === "active",
              "bg-yellow-50 text-yellow-700 border-yellow-200 ":
                sub.status === "incomplete",
              "bg-red-50 text-red-700 border-red-200 ":
                sub.status === "canceled",
            })}
          >
            {sub.status[0].toUpperCase() + sub.status.slice(1)}
          </Badge>
          <CardHeader>
            <h2 className="text-2xl font-semibold">Current Plan</h2>
            <span className="text-5xl font-bold">
              {sub.plan[0].toUpperCase() + sub.plan.slice(1)}
            </span>
          </CardHeader>
          <CardFooter className="flex mt-auto justify-end">
            <span className="flex items-center text-muted-foreground text-sm">
              {new Intl.NumberFormat().format(sub.messageCount)}
              <Slash className="size-4 -rotate-[24deg]" />
              {new Intl.NumberFormat().format(
                ALLOWED_MESSAGE_QUANTITY[
                  sub.plan.toUpperCase() as "BASIC" | "PRO"
                ]
              )}{" "}
              Messages
              <Tooltip>
                <TooltipTrigger className="ml-2">
                  <Info />
                </TooltipTrigger>
                <TooltipContent>
                  <span>
                    Message limit refreshes at the beginning of each billing
                    cycle.
                  </span>
                </TooltipContent>
              </Tooltip>
            </span>
          </CardFooter>
        </Card>
      </section>
      <section>
        <Card className="h-full">PlanUsage</Card>
      </section>
    </>
  );
}
