'use client'

import React, { type FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Send, Trash } from "lucide-react";
import ChatMessage from "./chat-message";
import {
  deleteMessagesAction,
  getActiveMessagesAction,
  getChatbotTestMessageCountAction,
  sendMessageAction,
} from "@/actions/chatbot-messages";
import type { Message } from "@/db/schema";
import { useChatSession } from "@/hooks/use-chat-session";
import { ChatbotStyles } from "@/types/embedded-chatbot";
import { usePathname } from "next/navigation";
import { ALLOWED_MESSAGE_QUANTITY } from "@/consts/messages";

interface Props {
  chatbotId: number;
  chatbotSlug: string;
  chatbotInstructions: string;
  chatbotStyles?: ChatbotStyles;
}

export default function Chat({
  chatbotId,
  chatbotSlug,
  chatbotInstructions,
  chatbotStyles,
}: Props) {
  const sessionId = useChatSession(chatbotSlug);
  const [messages, setMessages] = useState<Pick<Message, "role" | "message">[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [testMessageCount, setTestMessageCount] = useState(0);
  const scrollDiv = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    window.parent.postMessage({ type: "request-token" }, "*");

    const handler = (event: MessageEvent) => {
      if (event.data?.token) {
        setToken(event.data.token);
      }
    };

    window.addEventListener("message", handler);

    return () => window.removeEventListener("message", handler);
  }, []);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const [latestMessages, testMessageCount] = await Promise.all([
        getActiveMessagesAction({
          chatbotId,
          sessionId,
        }),
        getChatbotTestMessageCountAction({
          chatbotId,
        }),
      ]);

      setMessages(
        latestMessages.map(({ role, message }) => ({
          role,
          message,
        }))
      );
      setTestMessageCount(testMessageCount);
      setLoading(false);
    })();
  }, [sessionId, chatbotId]);

  useEffect(() => {
    scrollDiv.current?.scrollIntoView();
  }, [messages]);

  const handleTextAreaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
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
      sessionId,
      chatbotInstructions,
      token,
      pathname,
    });

    if (answer) {
      setMessages((prev) => {
        const updated = [...prev];

        const lastIndex = updated.length - 1;
        updated[lastIndex] = { role: "assistant", message: answer };

        return updated;
      });
      if (answer === "limit reached" && formRef.current) {
        (
          formRef.current.elements.namedItem(
            "chat-prompt"
          ) as HTMLTextAreaElement
        ).disabled = true;
      }
    }
    if (pathname.startsWith("/test-chatbot")) {
      const testMessageCount = await getChatbotTestMessageCountAction({
        chatbotId,
      });
      setTestMessageCount(testMessageCount);
    }
  };

  const clearChat = async () => {
    setMessages([]);
    await deleteMessagesAction({
      chatbotId,
      sessionId,
    });
  };

  return (
    <Card className="flex flex-col h-full relative">
      {chatbotStyles?.chat.showBranding && (
        <p className="absolute top-2 right-4 text-xs text-muted-foreground">
          Powered by{" "}
          <a
            href="https://agens.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            AgensAI
          </a>
        </p>
      )}
      {pathname.startsWith("/test-chatbot") && (
        <span className="absolute top-2 right-4 text-xs text-muted-foreground">
          {testMessageCount}/{ALLOWED_MESSAGE_QUANTITY.TEST} Test messages
        </span>
      )}
      <Button
        className="absolute top-0 left-2 px-0 has-[>svg]:px-0 hover:bg-transparent"
        variant="ghost"
        onClick={clearChat}
        disabled={messages.length === 0}
      >
        <Trash />
      </Button>
      <CardContent className="flex-grow overflow-y-scroll h-full max-h-11/12 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-accent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground mask-b-from-[95%] pt-4">
        {loading ? (
          <div aria-hidden className="animate-pulse flex flex-col space-y-4">
            <div
              aria-hidden
              className="h-14 bg-muted-foreground rounded w-3/4 self-end"
            />
            <div
              aria-hidden
              className="h-14 bg-muted-foreground rounded w-3/4"
            />
            <div
              aria-hidden
              className="h-14 bg-muted-foreground rounded w-3/4 self-end"
            />
            <div
              aria-hidden
              className="h-14 bg-muted-foreground rounded w-3/4"
            />
            <div
              aria-hidden
              className="h-14 bg-muted-foreground rounded w-3/4 self-end"
            />
          </div>
        ) : (
          messages.map(({ message, role }) => (
            <ChatMessage
              key={`${role}-${message}`}
              message={message}
              role={role}
              styles={chatbotStyles}
            />
          ))
        )}
        <div ref={scrollDiv} aria-hidden="true" className="w-0 h-0" />
      </CardContent>
      <CardFooter>
        <form
          ref={formRef}
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
            onKeyDown={handleKeyDown}
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
