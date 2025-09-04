import React from 'react'
import BusinessForm from './_components/business-form'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation';
import { getBusinessByClerkId } from '@/db/business';
import { getSubscriptionByClerkId } from '@/db/subscriptions';

export default async function BusinessInfoPage() {
  const {userId} = await auth();

  if (!userId) {
    redirect('/')
  }
  
  const [business, sub] = await Promise.all([getBusinessByClerkId({clerkId: userId}), getSubscriptionByClerkId({clerkId: userId})]);
  
  if (!business) {
    redirect('/')
  }

  return (
    <main className="my-2 space-y-4">
      <header>
        <h1 className="text-3xl font-bold">Business Information</h1>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">
              Update your business information and keep your chatbot context up to date.
            </p>
          </div>
        </div>
      </header>
      <BusinessForm businessData={business} userSub={sub} />
    </main>
  )
}
