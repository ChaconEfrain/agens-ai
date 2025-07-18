'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import React, { useEffect, useRef, useState } from 'react'
import { getCurrentDayMessagesPerChatbotByClerkIdAction } from '../_actions'
import { Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const colors = [
  "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"
]

export default function CurrentMessages({clerkId}: {clerkId: string}) {
  const [message, setMessage] = useState('');
  const [data, setData] = useState<{ chatbot: string; messages: number }[]>([]);
  const [totalMessages, setTotalMessages] = useState(0);
  const [currentDate, setCurrentDate] = useState('');
  const isFetching = useRef(false);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const getCurrentMessages = async () => {
      if (isFetching.current) return;

      isFetching.current = true;
      setMessage('');
      setCurrentDate(new Date().toLocaleString());
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const data = await getCurrentDayMessagesPerChatbotByClerkIdAction({clerkId, timezone});
  
      if (!data) {
        setMessage('Something went wrong getting the current messages');
        isFetching.current = false;
        return;
      } else if (data.length === 0) {
        setMessage("You don't have any chatbot yet");
        isFetching.current = false;
        return;
      }

      setData(data);
      setTotalMessages(data.reduce((acc, item) => acc + item.messages, 0));
      isFetching.current = false;

      if (isFirstLoad.current) {
        isFirstLoad.current = false;
      }
    };

    getCurrentMessages();
    const interval = setInterval(getCurrentMessages, 5 * 60 * 1000);

    return () => clearInterval(interval)
  }, []);
  

  return (
    <section className='min-h-[240px]'>
      <Card className="h-full relative">
        <CardHeader>
          <CardTitle>
            <h2 className="text-2xl font-semibold">Current day activity</h2>
          </CardTitle>
          <CardDescription>
            <p className='flex gap-1 items-center'><Clock className='size-4' /> {currentDate}</p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFetching.current && isFirstLoad.current && (
            <div aria-hidden className="animate-pulse flex flex-col space-y-1">
              <div
                aria-hidden
                className="h-9 bg-muted-foreground rounded w-full"
              />
              <div
                aria-hidden
                className="h-9 bg-muted-foreground rounded w-full"
              />
              <div
                aria-hidden
                className="h-9 bg-muted-foreground rounded w-full"
              />
            </div>
          )}
          {!message && data.length > 0 && data.map(({chatbot, messages}, i) => (
            <article key={chatbot} className='w-full flex flex-col gap-1'>
              <div className='w-full flex justify-between items-center'>
                <span className='min-w-14 flex gap-2 items-center'>
                  <span className='font-semibold'>
                    {chatbot.split('-')[0]}
                  </span>
                  <span className='text-muted-foreground text-sm'>
                    {`${new Intl.NumberFormat().format(messages)} ${messages === 0 || messages > 1 ? 'Messages' : 'Message'}`}
                  </span>
                </span>
                <span className='text-muted-foreground'>{totalMessages === 0 ? '0.0' : ((messages/totalMessages) * 100).toFixed(1)}%</span>
              </div>
              <Progress value={(messages/totalMessages) * 100} className='w-full' indicatorBgColor={colors[i % colors.length]} />
            </article>
          ))}
          {message && (
            <p className='text-center text-muted-foreground'>{message}</p>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
