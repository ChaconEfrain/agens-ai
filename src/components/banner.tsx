import { cn } from '@/lib/utils'
import { Bot } from 'lucide-react'
import React from 'react'

export default function Banner({bannerMessage, className}: {bannerMessage: string; className?: string}) {
  return (
    <div className={cn("flex flex-col gap-2 items-center justify-center", className)}>
      <Bot className="size-12" />
      <p className="text-lg text-muted-foreground font-medium">
        {bannerMessage}
      </p>
    </div>
  )
}
