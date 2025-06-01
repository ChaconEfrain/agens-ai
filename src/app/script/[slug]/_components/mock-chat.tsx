'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Send, Trash } from "lucide-react";
import ChatMessage from '@/components/chat-message'
import { ScriptStyles } from './page-container'

interface Props {
  styles: ScriptStyles
}

export default function MockChat({styles}: Props) {
  const mockMessages = [
    {
      role: "user",
      message: "Hello, do you have physical stores?",
    },
    {
      role: "assistant",
      message: "We are an online-only business in order to provide the best service possible, so we don't have physical stores.",
    },
  ];

  return (
    <Card className={`flex flex-col h-full relative`}>
      <Button
        className="absolute top-0 left-2 px-0 has-[>svg]:px-0 hover:bg-transparent"
        variant="ghost"
      >
        <Trash />
      </Button>
      <CardContent className="flex-grow overflow-y-scroll h-full max-h-11/12 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-accent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground mask-b-from-[95%] pt-4">
        {mockMessages.map(({ message, role }, i) => (
          <ChatMessage
            key={i}
            message={message}
            role={role}
            styles={styles}
          />
        ))}
      </CardContent>
      <CardFooter>
        <form
          className="relative border-primary/50 border-2 rounded-lg flex flex-col focus-within:border-primary/70 w-full"
        >
          <label htmlFor="chat-input" className="sr-only">
            Chat input
          </label>
          <Textarea
            name="chat-prompt"
            placeholder="Ask questions about your business"
            id="chat-input"
            rows={1}
            className="resize-none max-h-[150px] bg-transparent p-3 pb-1.5 text-sm outline-none ring-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-accent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground shadow-none border-none min-h-auto focus-visible:ring-[0px] pointer-events-none"
          />
          <Button
            variant="ghost"
            title="Send prompt"
            className="cursor-pointer self-end"
            type='button'
          >
            <Send />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
