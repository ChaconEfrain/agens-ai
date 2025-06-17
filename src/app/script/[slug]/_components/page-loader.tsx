import React from 'react'
import ChatbotReady from './chatbot-ready'

export default function PageLoader() {
  return (
    <div>
      <header className="my-4">
        <div className="h-9 w-96 animate-pulse bg-muted-foreground rounded-xl" />
        <p className="text-muted-foreground">
          Your chatbot is ready! Copy the script below and paste it into your
          website to start engaging with your customers.
        </p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        <div className="flex flex-col gap-6">
          <ChatbotReady />
          <div className="h-[596px] w-full animate-pulse bg-muted-foreground rounded-xl" />
        </div>
        <div className="h-[756px] w-full animate-pulse bg-muted-foreground rounded-xl" />
        <div className="h-screen w-full col-span-full animate-pulse bg-muted-foreground rounded-xl" />
      </div>
    </div>
  )
}
