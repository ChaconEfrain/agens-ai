'use client'

import React, { type FormEvent, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'
import ChatMessage from './chat-message'
import { sendMessageAction } from '../_actions'

interface Message {
  sender: "user" | "ai";
  message: string;
}

interface Props {
  chatbotId: number;
  chatbotInstructions: string;
}

export default function Chat({chatbotId, chatbotInstructions}: Props) {

  const [messages, setMessages] = useState<Message[]>([]);
  const scrollDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollDiv.current?.scrollIntoView()
  }, [messages])

  const handleTextAreaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
  };

  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form)
    const message = formData.get('chat-prompt')?.toString();
    if (!message?.trim()) return;
    
    setMessages(prev => [...prev, {sender: 'user', message}, {sender: 'ai', message: ''}])
    form.reset()

    const answer = await sendMessageAction({message, chatbotId, chatbotInstructions})

    if (answer) {
      setMessages((prev) => {
        const updated = [...prev];

        const lastIndex = updated.length - 1;
        updated[lastIndex] = { sender: 'ai', message: answer };

        return updated;
      })
    }
  }

  return (
    <Card className="flex flex-col h-full">
      <CardContent className="flex-grow overflow-y-scroll h-full max-h-11/12 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-accent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground mask-b-from-[95%] pt-4">
      {messages.map(({message, sender}, i) => (
        <ChatMessage
          key={i}
          message={message}
          sender={sender}
        />
      ))}
      <div ref={scrollDiv} aria-hidden='true' className='w-0 h-0' />
      </CardContent>
      <CardFooter>
        <form 
          onSubmit={sendMessage}
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
            className="resize-none max-h-[150px] bg-transparent p-3 pb-1.5 text-sm outline-none ring-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-accent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground shadow-none border-none min-h-auto focus-visible:ring-[0px]"
            onInput={handleTextAreaResize}
          />
          <Button
            variant="ghost"
            title="Send prompt"
            className="cursor-pointer self-end"
          >
            <Send />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
