'use client'

import React, { useState } from 'react'
import { Button } from './ui/button'
import Link from 'next/link'
import { createStripeSessionAction } from '@/actions/stripe'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { LoaderCircle } from 'lucide-react'

export default function SubscribeButton({plan}: {plan: string}) {

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const redirectToStripeCheckout = async () => {
    setLoading(true);
    const fromPage = window.location.href;
    const origin = window.location.origin;
    const result = await createStripeSessionAction({fromPage, origin, plan})

    if (result.url) {
      router.push(result.url)
    } else {
      toast.error(result.message)
    }

    setLoading(false);
  }

  if (plan === 'Free') return (
    <Button asChild variant='outline'>
      <Link href='/create-chatbot'>Get Started</Link>
    </Button>
  )

  return (
    <Button 
      variant={plan === 'Pro' ? 'outline' : 'default'} 
      className="w-full"
      onClick={redirectToStripeCheckout}
      disabled={loading}
    >
      {loading ? (
        <>
          Subscribe Now <LoaderCircle className="animate-spin" />
        </>
      ) : 'Subscribe Now'}
    </Button>
  )
}
