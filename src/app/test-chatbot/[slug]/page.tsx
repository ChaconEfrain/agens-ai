import React from "react";
import { getChatbotBySlug } from "@/db/chatbot";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Box, File, Info, Smile, Truck } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
        <p className="text-muted-foreground">
          Test your chatbot before deploying it to your website
        </p>
      </header>
      <main>
        <div className="grid grid-cols-[70fr_30fr] gap-4">
          <section className="h-[80dvh] overflow-hidden">
            <Chat
              chatbotId={chatbot.id}
              chatbotInstructions={chatbot.instructions}
            />
          </section>
          <section className="h-[80dvh] overflow-hidden">
            <Card className="h-full gap-4">
              <CardHeader>
                <CardTitle>
                  <h2 className="text-xl font-bold">Chatbot context</h2>
                </CardTitle>
                <CardDescription>
                  <p>
                    The chatbot will answer questions based on this information
                  </p>
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-y-scroll h-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-accent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground">
                <Accordion type="multiple">
                  <AccordionItem value="business-info">
                    <AccordionTrigger className="cursor-pointer">
                      <div className="flex gap-2 items-center">
                        <Info />
                        <span>Business</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-1">
                      <div>
                        <span className="text-muted-foreground">Name: </span>
                        <span>{chatbot.business.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <span className="text-muted-foreground">
                          Description:{" "}
                        </span>
                        <span
                          title={chatbot.business.description}
                          className="line-clamp-1"
                        >
                          {chatbot.business.description}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Website: </span>
                        <span>
                          {chatbot.business.website ?? "Not provided"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Founded: </span>
                        <span>
                          {chatbot.business.foundedYear ?? "Not provided"}
                        </span>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="products-services">
                    <AccordionTrigger className="cursor-pointer">
                      <div className="flex gap-2 items-center">
                        <Box />
                        <span>Products/Services</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-1">
                      <div>
                        <span className="text-muted-foreground">Offers: </span>
                        <span>{`${chatbot.business.productsOrServices[0].toUpperCase()}${chatbot.business.productsOrServices.slice(
                          1
                        )}`}</span>
                      </div>
                      {chatbot.business.productsOrServices !== "services" && (
                        <div>
                          <span className="text-muted-foreground">
                            Ships products:{" "}
                          </span>
                          <span>
                            {chatbot.business.hasPhysicalProducts
                              ? "Yes"
                              : "No"}
                          </span>
                        </div>
                      )}
                      <span className="text-muted-foreground">Items:</span>
                      <Accordion type="multiple" className="ml-4">
                        {chatbot.business.items?.map((item, i) => (
                          <AccordionItem key={`item-${i}`} value={`item-${i}`}>
                            <AccordionTrigger className="cursor-pointer">
                              <span>- {item.name}</span>
                            </AccordionTrigger>
                            <AccordionContent className="flex flex-col gap-1">
                              <div className="flex gap-1">
                                <span className="text-muted-foreground">
                                  Price:{" "}
                                </span>
                                <span
                                  className="line-clamp-1"
                                  title={item.price}
                                >
                                  {item.price}
                                </span>
                              </div>
                              <div className="flex gap-1">
                                <span className="text-muted-foreground">
                                  Description:{" "}
                                </span>
                                <span
                                  className="line-clamp-1"
                                  title={item.description}
                                >
                                  {item.description}
                                </span>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </AccordionContent>
                  </AccordionItem>
                  {chatbot.business.hasPhysicalProducts && (
                    <AccordionItem value="shipping">
                      <AccordionTrigger className="cursor-pointer">
                        <div className="flex gap-2 items-center">
                          <Truck />
                          <span>Shipping logistics</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="flex flex-col gap-1">
                        <div>
                          <span className="text-muted-foreground">
                            International shipping:{" "}
                          </span>
                          <span>
                            {chatbot.business.internationalShipping
                              ? "Yes"
                              : "No"}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <span className="text-muted-foreground">
                            Shipping methods:{" "}
                          </span>
                          <span
                            title={chatbot.business.shippingMethods ?? ""}
                            className="line-clamp-1"
                          >
                            {chatbot.business.shippingMethods}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <span className="text-muted-foreground">
                            Delivery timeframes:{" "}
                          </span>
                          <span
                            title={chatbot.business.deliveryTimeframes ?? ""}
                            className="line-clamp-1"
                          >
                            {chatbot.business.deliveryTimeframes}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <span className="text-muted-foreground">
                            Return policies:{" "}
                          </span>
                          <span
                            title={chatbot.business.returnPolicy ?? ""}
                            className="line-clamp-1"
                          >
                            {chatbot.business.returnPolicy}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <span className="text-muted-foreground">
                            Restrictions:{" "}
                          </span>
                          <span
                            title={chatbot.business.shippingRestrictions ?? ""}
                            className="line-clamp-1"
                          >
                            {chatbot.business.shippingRestrictions}
                          </span>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  <AccordionItem value="customer-service">
                    <AccordionTrigger className="cursor-pointer">
                      <div className="flex gap-2 items-center">
                        <Smile />
                        <span>Customer service</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-1">
                      <div className="flex gap-1">
                        <span className="text-muted-foreground">Support:</span>
                        <span
                          title={chatbot.business.supportHours ?? ""}
                          className="line-clamp-1"
                        >
                          {chatbot.business.supportHours}
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        Contact methods:
                      </span>
                      <Accordion type="multiple" className="ml-4">
                        {chatbot.business.email && (
                          <AccordionItem value="email">
                            <AccordionTrigger className="cursor-pointer">
                              <span>- Email</span>
                            </AccordionTrigger>
                            <AccordionContent className="flex flex-col gap-1">
                              <div className="flex gap-1">
                                <span className="text-muted-foreground">
                                  Value:{" "}
                                </span>
                                <span
                                  className="line-clamp-1"
                                  title={chatbot.business.email}
                                >
                                  {chatbot.business.email}
                                </span>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        )}
                      </Accordion>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="chatbot-config">
                    <AccordionTrigger className="cursor-pointer">
                      <div className="flex gap-2 items-center">
                        <Bot />
                        <span>Chatbot config</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-1">
                      <div className="flex gap-1">
                        <span className="text-muted-foreground">
                          Objective:
                        </span>
                        <span
                          title={chatbot.business.chatbotObjective}
                          className="line-clamp-1"
                        >
                          {chatbot.business.chatbotObjective}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <span className="text-muted-foreground">Tone:</span>
                        <span>{chatbot.business.chatbotTone}</span>
                      </div>
                      <div className="flex gap-1">
                        <span className="text-muted-foreground">Style:</span>
                        <span
                          title={chatbot.business.chatbotStyle}
                          className="line-clamp-1"
                        >
                          {chatbot.business.chatbotStyle}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <span className="text-muted-foreground">
                          Personality:
                        </span>
                        <span
                          title={chatbot.business.chatbotPersonality}
                          className="line-clamp-1"
                        >
                          {chatbot.business.chatbotPersonality}
                        </span>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="documents">
                    <AccordionTrigger className="cursor-pointer">
                      <div className="flex gap-2 items-center">
                        <File />
                        <span>Documents</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-1">
                      <div className="flex gap-1">
                        <span className="text-muted-foreground">TODO:</span>
                        <span
                          title={chatbot.business.chatbotObjective}
                          className="line-clamp-1"
                        >
                          List uploaded documents
                        </span>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
