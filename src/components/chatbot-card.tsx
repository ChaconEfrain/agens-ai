import React from 'react'
import { Card, CardContent } from "./ui/card";
import { Business, Chatbot, Message } from "@/db/schema";
import { ChatbotCardMenu } from "./chatbot-card-menu";
import { Prettify } from "@/types/helpers";

interface Props {
  bot: Prettify<Chatbot & { messages: Message[] } & { business: Business }>;
}

export default function ChatbotCard({ bot }: Props) {
  return (
    <Card className="relative">
      <CardContent>
        <div className="absolute top-2 right-2">
          <ChatbotCardMenu chatbotId={bot.id} />
        </div>
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
      </CardContent>
    </Card>
  );
}
