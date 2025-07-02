import { Card, CardContent, CardHeader } from '@/components/ui/card'
import React from 'react'
import Chart from './chart'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation';
import { getCurrentPeriodMessagesPerDayByClerkId } from '@/db/messages';
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function MessagesChart() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const messages = await getCurrentPeriodMessagesPerDayByClerkId({
    clerkId: userId,
  });

  return (
    <section className="col-start-1 col-end-3">
      <Card className="h-full">
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Current period activity</h2>
          <Link
            href="/dashboard/message-history"
            className="text-muted-foreground flex items-center gap-1 group"
          >
            View message history{" "}
            <ArrowRight className="size-4 group-hover:translate-x-2 transition-transform duration-300" />
          </Link>
        </CardHeader>
        <CardContent>
          <Chart messagesPerDay={messages} />
        </CardContent>
      </Card>
    </section>
  );
}
