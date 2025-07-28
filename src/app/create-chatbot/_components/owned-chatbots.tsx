import ChatbotCards from "@/components/chatbot-cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { ALLOWED_MESSAGE_QUANTITY } from "@/consts/subscription";
import { Business, Chatbot, Message, Subscription } from "@/db/schema";
import { cn } from "@/lib/utils";
import { Prettify } from "@/types/helpers";
import { Slash } from "lucide-react";
import Link from "next/link";
import React from "react";

interface Props {
  userChatbots:
    | Prettify<Chatbot & { messages: Message[] } & { business: Business }>[]
    | undefined;
  userSub: Subscription | undefined;
}

export default async function OwnedChatbots({ userChatbots, userSub }: Props) {
  return (
    <Card className="h-full max-h-[720px] relative">
      <div className="absolute top-2 right-2 flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {userSub
            ? userSub.plan[0].toUpperCase() + userSub.plan.slice(1) + " plan"
            : "Free plan"}
        </span>
        <Badge
          className={cn({
            "bg-green-50 text-green-700 border-green-200 ":
              userSub?.status === "active",
            "bg-yellow-50 text-yellow-700 border-yellow-200 ":
              userSub?.status === "incomplete",
            "bg-red-50 text-red-700 border-red-200 ":
              userSub?.status === "canceled",
            "bg-gray-50 text-gray-700 border-gray-200 ":
              userSub?.status === "unsubscribed",
          })}
        >
          {userSub
            ? userSub.status[0].toUpperCase() + userSub.status.slice(1)
            : "Unsubscribed"}
        </Badge>
      </div>
      <CardHeader>
        <h2 className="text-xl font-semibold">Your Chatbots</h2>
      </CardHeader>
      <ChatbotCards userChatbots={userChatbots} sub={userSub} />
      <CardFooter className="flex flex-col gap-2 mt-auto">
        {(userSub || (userChatbots && userChatbots?.length > 0)) && (
          <span className="self-end text-sm text-muted-foreground">
            {userSub && userSub.status !== "canceled" ? (
              <span className="flex items-center">
                {new Intl.NumberFormat().format(userSub.messageCount)}
                <Slash className="size-4 -rotate-[24deg]" />
                {new Intl.NumberFormat().format(
                  ALLOWED_MESSAGE_QUANTITY[
                    userSub.plan.toUpperCase() as "BASIC" | "PRO"
                  ]
                )}{" "}
                Messages
              </span>
            ) : (
              <span className="flex items-center">
                {new Intl.NumberFormat().format(
                  userChatbots?.[0]?.messages.length &&
                    userChatbots?.[0]?.testMessagesCount !== undefined
                    ? userChatbots[0].messages.length -
                        userChatbots[0].testMessagesCount
                    : 0
                )}
                <Slash className="size-4 -rotate-[24deg]" />
                {new Intl.NumberFormat().format(
                  ALLOWED_MESSAGE_QUANTITY.FREE
                )}{" "}
                Messages
              </span>
            )}
          </span>
        )}
        <Button asChild className="w-full">
          <Link href="/pricing">Manage Subscription</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
