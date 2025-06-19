import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import React from 'react'

export default function ChatbotLimitMessage() {
  return (
    <Card className='absolute top-1/2 left-1/2 -translate-1/2 z-20 gap-2'>
      <CardHeader>
        <CardTitle>
          <h3 className='text-lg font-semibold'>Chatbot limit reached</h3>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-muted-foreground'>You have reached the maximum number of chatbots allowed for your current subscription plan.</p>
      </CardContent>
      <CardFooter>
        <Button asChild className='w-full'>
          <Link href='/pricing'>
            Manage Subscription
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
