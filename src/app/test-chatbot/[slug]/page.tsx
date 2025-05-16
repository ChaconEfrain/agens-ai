import React from "react";
import { getChatbotBySlug } from "@/db/chatbot";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Chat from "./_components/chat";

export default async function TestChatbot({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const { slug } = await params;
  const chatbot = await getChatbotBySlug({ slug });

  if (!chatbot) notFound();

  return (
  <div>
    <header className="my-4">
      <h1 className="text-3xl font-bold">{chatbot.business.name} Chatbot</h1>
      <p className="text-muted-foreground">Test your chatbot before deploying it to your website</p>
    </header>
    <main>
      <div className="grid grid-cols-[70fr_30fr] gap-4">
        <section className="h-[80dvh] overflow-hidden">
          <Chat
            chatbotId={chatbot.id}
            chatbotInstructions={chatbot.instructions}
          />
        </section>
        <section>
          <Card className="h-full gap-4">
            <CardHeader>
              <CardTitle>
                <h2 className="text-xl font-bold">
                  Chatbot context
                </h2>
              </CardTitle>
              <CardDescription>
                <p>The chatbot will answer questions based on this information</p>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="cursor-pointer">
                    <div className="flex gap-2 items-center">
                      <Info/> Business
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-1">
                    <div>
                      <span className="text-muted-foreground">Name: </span>
                      <span>{chatbot.business.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <span className="text-muted-foreground">Description: </span>
                      <span title={chatbot.business.description} className="line-clamp-1">{chatbot.business.description}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Website: </span>
                      <span>{chatbot.business.website ?? 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Founded: </span>
                      <span>{chatbot.business.foundedYear ?? 'Not provided'}</span>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              {/*
                TODO: Fill with business info
              */}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  </div>
  );
}
