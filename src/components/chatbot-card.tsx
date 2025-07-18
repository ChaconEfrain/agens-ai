import React from 'react'
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Business, Chatbot, Message } from "@/db/schema";
import { ChatbotCardMenu } from "./chatbot-card-menu";
import { Prettify } from "@/types/helpers";
import ChatbotMessageCount from "./chatbot-message-count";

interface Props {
  bot: Prettify<Chatbot & { messages: Message[] } & { business: Business }>;
}

export default function ChatbotCard({ bot }: Props) {
  return (
    <Card className="relative">
      <CardHeader className="gap-0">
        <h3 className="text-xl font-semibold">{bot.business.name}</h3>
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
      <CardFooter className="flex justify-end mt-auto">
        <ChatbotMessageCount bot={bot} />
      </CardFooter>
    </Card>
  );
}
