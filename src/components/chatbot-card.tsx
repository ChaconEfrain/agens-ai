import React from 'react'
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Business, Chatbot, Message, Subscription } from "@/db/schema";
import { ChatbotCardMenu } from "./chatbot-card-menu";
import { Prettify } from "@/types/helpers";
import ChatbotMessageCount from "./chatbot-message-count";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import ClientDate from "./client-date";

interface Props {
  bot: Prettify<Chatbot & { messages: Message[] } & { business: Business }>;
  sub: Subscription | undefined;
}

export default function ChatbotCard({ bot, sub }: Props) {
  return (
    <Card className="relative">
      <CardHeader className="gap-0">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold">{bot.business.name}</h3>
          <Badge
            className={cn({
              "bg-green-50 text-green-700 border-green-200 ": bot.isActive,
              "bg-red-50 text-red-700 border-red-200 ": !bot.isActive,
            })}
          >
            {bot.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div>
          {bot.business.allowedWebsites.map((website, i, arr) => (
            <a
              key={website}
              href={website}
              target="_blank"
              rel="noopener noreferer"
              className="hover:underline text-sm"
            >
              {new URL(website).hostname.replace(/^www\./, "")}
              {i === arr.length - 1 ? "" : ", "}
            </a>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="absolute top-2 right-2">
          <ChatbotCardMenu businessId={bot.businessId} chatbotSlug={bot.slug} />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-1 items-end mt-auto">
        <ChatbotMessageCount bot={bot} />
        {bot.deactivateAtPeriodEnd && (
          <p className="text-sm text-muted-foreground">
            Will become inactive on <ClientDate date={sub?.periodEnd!} />
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
