import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { ALLOWED_MESSAGE_QUANTITY } from '@/consts/subscription';
import { getSubscriptionByClerkId } from '@/db/subscriptions';
import { cn } from '@/lib/utils';
import { auth } from '@clerk/nextjs/server'
import { Slash } from 'lucide-react';
import { redirect } from 'next/navigation';
import React from 'react'

export default async function UserPlan() {

  const {userId} = await auth();

  if (!userId) {
    redirect('/')
  }

  const sub = await getSubscriptionByClerkId({clerkId: userId});

  if (!sub) {
    redirect('/')
  }

  return (
    <>
      <section>
        <Card className='h-full relative'>
          <Badge
            className={cn('absolute top-2 right-2', {
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
            <h2 className="text-2xl font-semibold">
              Current Plan
            </h2>
          </CardHeader>
          <CardContent>
            <span className='text-5xl font-bold'>
              {sub.plan[0].toUpperCase() + sub.plan.slice(1)}
            </span>
          </CardContent>
          <CardFooter className='flex mt-auto justify-end'>
            <span className="flex items-center text-muted-foreground text-sm">
              {new Intl.NumberFormat().format(sub.messageCount)}
              <Slash className="size-4 -rotate-[24deg]" />
              {new Intl.NumberFormat().format(
                ALLOWED_MESSAGE_QUANTITY[
                  sub.plan.toUpperCase() as "BASIC" | "PRO"
                ]
              )}{" "}
              Messages
            </span>
          </CardFooter>
        </Card>
      </section>
      <section>
        <Card className='h-full'>
          PlanUsage
        </Card>
      </section>
    </>
  )
}
