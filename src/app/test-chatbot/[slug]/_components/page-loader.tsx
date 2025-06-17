import React from 'react'

export default function PageLoader() {
  return (
    <div>
      <header className="my-4">
        <div className="h-9 w-96 animate-pulse bg-muted-foreground rounded-xl" />
        <p className="text-muted-foreground">
          Test your chatbot before deploying it to your website. These messages
          won't count to your plan limit.
        </p>
      </header>
      <main>
        <div className="grid grid-cols-[70fr_30fr] gap-4">
          <div className="h-[80dvh] w-full animate-pulse bg-muted-foreground rounded-xl" />
          <div className="h-[80dvh] w-full animate-pulse bg-muted-foreground rounded-xl" />
        </div>
      </main>
    </div>
  )
}
