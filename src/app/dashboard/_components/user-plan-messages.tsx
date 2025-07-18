'use client'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ALLOWED_MESSAGE_QUANTITY } from '@/consts/subscription'
import { Subscription } from '@/db/schema'
import { Info, Slash } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { getSubscriptionByClerkIdAction } from '../_actions'

interface Props {
  clerkId: string;
  sub: Subscription
}

export default function UserPlanMessages({sub, clerkId}: Props) {
  const [subscription, setSubscription] = useState(sub);
  const isFetching = useRef(false);

  useEffect(() => {
    const getSubscription = async () => {
      if (isFetching.current) return;

      isFetching.current = true;
      const data = await getSubscriptionByClerkIdAction({clerkId});
  
      if (!data) {
        isFetching.current = false;
        return;
      }

      setSubscription(data);
      isFetching.current = false;
    };

    const interval = setInterval(getSubscription, 5 * 60 * 1000);

    return () => clearInterval(interval)
  }, []);

  return (
    <span className="flex items-center text-muted-foreground text-sm">
      {new Intl.NumberFormat().format(subscription.messageCount)}
      <Slash className="size-4 -rotate-[24deg]" />
      {new Intl.NumberFormat().format(
        ALLOWED_MESSAGE_QUANTITY[
          subscription.plan.toUpperCase() as "BASIC" | "PRO"
        ]
      )}{" "}
      Messages
      <Tooltip>
        <TooltipTrigger className="ml-2">
          <Info />
        </TooltipTrigger>
        <TooltipContent>
          <span>
            Message limit refreshes at the beginning of each billing
            cycle.
          </span>
        </TooltipContent>
      </Tooltip>
    </span>
  )
}
