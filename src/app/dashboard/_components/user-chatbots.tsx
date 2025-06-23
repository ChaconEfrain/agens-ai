import ChatbotCards from '@/components/chatbot-cards'
import { Card, CardHeader } from '@/components/ui/card'
import { getChatbotsByClerkId } from '@/db/chatbot';
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation';
import React from 'react'

export default async function UserChatbots() {
  const {userId} = await auth();

  if (!userId) {
    redirect('/')
  }

  const chatbots = await getChatbotsByClerkId({clerkId: userId});

  return (
    <section className='col-start-3 col-end-4 row-span-full'>
      <Card className='h-full'>
        <CardHeader>
          <h2 className="text-2xl font-semibold">Your Chatbots</h2>
        </CardHeader>
        <ChatbotCards userChatbots={chatbots} />
      </Card>
    </section>
  )
}
