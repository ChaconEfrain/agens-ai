'use client'

import SubscriptionNeededModal from '@/components/subscription-needed-modal'
import { Subscription } from '@/db/schema'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import React, { MouseEvent, useState } from 'react'

interface Props {
  sub: Subscription;
}

export default function MessageHistoryLink({sub}: Props) {

  const [openModal, setOpenModal] = useState(false)

  const handleMessageHistoryClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (sub.plan === 'free') {
      e.preventDefault();
      setOpenModal(true);
      setTimeout(() => { //TODO: This is ugly, find another way
        const topLoader = document.getElementById('nprogress');
        if (topLoader) {
          (topLoader.firstChild as HTMLElement).style.height = '0px'
        }
      }, 1000);
    }
  }

  return (
    <>
      <Link
        href="/dashboard/message-history"
        className="text-muted-foreground flex items-center gap-1 group"
        onClick={handleMessageHistoryClick}
      >
        View message history{" "}
        <ArrowRight className="size-4 group-hover:translate-x-2 transition-transform duration-300" />
      </Link>
      <SubscriptionNeededModal message="You need to subscribe to see your message history" openModal={openModal} setOpenModal={setOpenModal} />
    </>
  )
}
