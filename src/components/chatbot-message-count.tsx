'use client'

import { getChatbotBySlugAction } from '@/actions/chatbot';
import { Chatbot } from '@/db/schema'
import { MessageSquare } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

export default function ChatbotMessageCount({bot}: {bot: Chatbot}) {

  const [chatbot, setChatbot] = useState(bot);
  const isFetching = useRef(false);
  
  useEffect(() => {
    const getChatbot = async () => {
      if (isFetching.current) return;

      isFetching.current = true;
      const data = await getChatbotBySlugAction({slug: bot.slug});
  
      if (!data) {
        isFetching.current = false;
        return;
      }

      setChatbot(data);
      isFetching.current = false;
    };

    const interval = setInterval(getChatbot, 5 * 60 * 1000);

    return () => clearInterval(interval)
  }, []);

  return (
    <span className="text-sm text-muted-foreground flex items-center gap-2">
      <MessageSquare className="size-5" />{" "}
      {new Intl.NumberFormat().format(chatbot.currentPeriodMessagesCount)}{" "}
      Messages this period
    </span>
  )
}
