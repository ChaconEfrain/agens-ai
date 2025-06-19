import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { ALLOWED_MESSAGE_QUANTITY } from "@/consts/subscription";
import { Business, Chatbot, Message, Subscription } from "@/db/schema";
import { cn } from "@/lib/utils";
import { Bot, EllipsisVerticalIcon } from "lucide-react";
import Link from "next/link";
import React from 'react'

interface Props {
  userChatbots: (Chatbot & {messages: Message[]} & {business: Business})[] | undefined
  userSub: Subscription | undefined
}

export default async function OwnedChatbots({userChatbots, userSub}: Props) {
  return (
    <Card className='max-h-screen relative'>
      <div className='absolute top-2 right-2 flex items-center gap-2'>
        <span className='text-sm text-muted-foreground'>
          {userSub ? (
            userSub.plan[0].toUpperCase() + userSub.plan.slice(1) + ' plan'
          ) : 'Free plan'}
        </span>
        <Badge className={cn({
          'bg-green-50 text-green-700 border-green-200 ': userSub?.status === 'active',
          'bg-yellow-50 text-yellow-700 border-yellow-200 ': userSub?.status === 'incomplete',
          'bg-red-50 text-red-700 border-red-200 ': userSub?.status === 'canceled',
          'bg-gray-50 text-gray-700 border-gray-200 ': !userSub,
        })}>
          {userSub ? (
            userSub.status[0].toUpperCase() + userSub.status.slice(1)
          ) : 'Unsubscribed'}
        </Badge>
      </div>
      <CardHeader>
        <h2 className='text-xl font-semibold'>Your Chatbots</h2>
      </CardHeader>
      <CardContent className='overflow-y-scroll [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-accent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground'>
        {(userChatbots?.length ?? 0) > 0 ? userChatbots?.map((bot) => (
          <Card key={bot.id} className='relative'>
            <CardContent>
              <button className='absolute top-2 right-2 cursor-pointer'>
                <EllipsisVerticalIcon className='size-5' />
              </button>
              <h3 className='text-xl font-semibold'>{bot.business.name}</h3>
              <div>
                {bot.business.allowedWebsites.map((website, i, arr) => (
                  <a key={website} href={website} target='_blank' rel='noopener noreferer' className='hover:underline text-sm'>{new URL(website).hostname.replace(/^www\./, "")}{i === arr.length - 1 ? '' : ', '}</a>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <span className='text-sm text-muted-foreground'>Updated at {new Date(bot.updatedAt ?? bot.createdAt).toLocaleString()}</span>
            </CardFooter>
          </Card>
        )) : (
          <div className="flex flex-col gap-2 items-center justify-center py-12">
            <Bot className="size-12" />
            <p className="text-lg text-muted-foreground font-medium">
              You don't have any chatbots yet
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className='flex flex-col gap-2 mt-auto'>
        {(userSub || (userChatbots && userChatbots?.length > 0)) && (
          <span className='self-end text-sm text-muted-foreground'>
            {userSub && userSub.status !== 'canceled' ? (
              `${userSub.messageCount}/${ALLOWED_MESSAGE_QUANTITY[userSub.plan.toUpperCase() as 'BASIC' | 'PRO']} Messages`
            ) : (
              `${userChatbots?.[0]?.messages.length && userChatbots?.[0]?.testMessagesCount !== undefined
                ? userChatbots[0].messages.length - userChatbots[0].testMessagesCount
                : 0}/${ALLOWED_MESSAGE_QUANTITY.FREE} Messages`
            )}
          </span>
        )}
        <Button asChild className='w-full'>
          <Link href='/pricing'>
            Manage Subscription
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
