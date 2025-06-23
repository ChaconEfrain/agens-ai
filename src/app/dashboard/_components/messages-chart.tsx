import { Card, CardContent, CardHeader } from '@/components/ui/card'
import React from 'react'
import Chart from './chart'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation';
import { getCurrentPeriodMessagesPerDayByClerkId } from '@/db/messages';

export default async function MessagesChart() {

  const {userId} = await auth();

  if (!userId) {
    redirect('/')
  }

  const messages = await getCurrentPeriodMessagesPerDayByClerkId({clerkId: userId});

  return (
    <section className='col-start-1 col-end-3'>
      <Card className='h-full'>
        <CardHeader>
          <h2 className="text-2xl font-semibold">
            Current period activity
          </h2>
        </CardHeader>
        <CardContent>
          <Chart messagesPerDay={messages} />
        </CardContent>
      </Card>
    </section>
  )
}
