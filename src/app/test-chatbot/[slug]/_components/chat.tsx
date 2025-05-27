'use client'

import React, { type FormEvent, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { LoaderCircle, Send, Trash } from "lucide-react";
import ChatMessage from "./chat-message";
import { deleteMessagesAction, sendMessageAction } from "../_actions";
import type { Message } from "@/db/schema";
import { toast } from "sonner";

interface Props {
  chatbotId: number;
  chatbotSlug: string;
  chatbotInstructions: string;
  historyMessages: Pick<Message, "role" | "message">[];
}

export default function Chat({
  chatbotId,
  chatbotSlug,
  chatbotInstructions,
  historyMessages,
}: Props) {
  const [messages, setMessages] = useState(historyMessages);
  const [loading, setLoading] = useState(false);
  const scrollDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollDiv.current?.scrollIntoView();
  }, [messages]);

  const handleTextAreaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
  };

  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const message = formData.get("chat-prompt")?.toString();
    if (!message?.trim()) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", message },
      { role: "assistant", message: "" },
    ]);
    form.reset();

    const answer = await sendMessageAction({
      message,
      chatbotId,
      chatbotInstructions,
    });

    if (answer) {
      setMessages((prev) => {
        const updated = [...prev];

        const lastIndex = updated.length - 1;
        updated[lastIndex] = { role: "assistant", message: answer };

        return updated;
      });
    }
  };

  const clearChat = async () => {
    setLoading(true);
    const result = await deleteMessagesAction({
      chatbotId,
      chatbotSlug,
    });

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    setLoading(false);
    setMessages([]);
  };

  return (
    <Card className="flex flex-col h-full relative">
      <Button
        className="absolute -top-10 right-0"
        variant="outline"
        onClick={clearChat}
        disabled={loading || messages.length === 0}
      >
        <Trash />{" "}
        {loading ? (
          <>
            Clearing chat <LoaderCircle className="animate-spin" />
          </>
        ) : (
          "Clear chat"
        )}
      </Button>
      <CardContent className="flex-grow overflow-y-scroll h-full max-h-11/12 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-accent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground mask-b-from-[95%] pt-4">
        {messages.map(({ message, role }, i) => (
          <ChatMessage key={i} message={message} sender={role} />
        ))}
        <div ref={scrollDiv} aria-hidden="true" className="w-0 h-0" />
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
  );
}
