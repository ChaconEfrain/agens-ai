import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import CurrentPeriodChart from "./current-period-chart";
import { getCurrentPeriodMessagesPerDayByClerkId } from "@/db/messages";
import { Subscription } from "@/db/schema";
import ClientDate from "@/components/client-date";

export default async function MessagesChart({
  clerkId,
  sub,
}: {
  clerkId: string;
  sub: Subscription;
}) {
  const messages = await getCurrentPeriodMessagesPerDayByClerkId({
    clerkId,
  });

  return (
    <section className="col-start-1 col-end-3">
      <Card className="h-full relative">
        <CardHeader>
          <CardTitle>
            <h2 className="text-2xl font-semibold">Current period activity</h2>
          </CardTitle>
          <CardDescription>
            {sub.periodEnd && sub.periodStart ? (
              <p>
                Showing messages between <ClientDate date={sub.periodStart} />{" "}
                and <ClientDate date={sub.periodEnd} />
              </p>
            ) : (
              <p>Showing your current messages</p>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CurrentPeriodChart messagesPerDay={messages} clerkId={clerkId} />
        </CardContent>
      </Card>
    </section>
  );
}
