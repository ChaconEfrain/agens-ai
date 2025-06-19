import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowRight, Bot, Box, File, Info, Smile, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Business, Chatbot, File as FileSchema } from "@/db/schema";
import EditContext from "./edit-context";
import Link from "next/link";

interface Props {
  chatbot: Chatbot & {
    business: Business;
  } & {
    files: FileSchema[];
  };
}

export default function ChatbotContext({ chatbot }: Props) {
  return (
    <Card className="h-full gap-4 relative">
      <Button className="absolute -top-10 right-0" variant="ghost" asChild>
        <Link href={`/script/${chatbot.slug}`}>
          Generate script <ArrowRight />
        </Link>
      </Button>
      <CardHeader>
        <CardTitle>
          <h2 className="text-xl font-bold">Chatbot context</h2>
        </CardTitle>
        <CardDescription>
          <p>The chatbot will answer questions based on this information</p>
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
                <span className="text-muted-foreground whitespace-nowrap">
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
                {/* TODO: format correctly in case we have more than one website */}
                <span className="text-muted-foreground">Websites: </span>
                <span>{chatbot.business.allowedWebsites.join(", ")}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Founded: </span>
                <span>{chatbot.business.foundedYear ?? "Not provided"}</span>
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
                    {chatbot.business.hasPhysicalProducts ? "Yes" : "No"}
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
                        <span className="text-muted-foreground whitespace-nowrap">
                          Price:{" "}
                        </span>
                        <span className="line-clamp-1" title={item.price}>
                          {item.price}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <span className="text-muted-foreground whitespace-nowrap">
                          Description:{" "}
                        </span>
                        <span className="line-clamp-1" title={item.description}>
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
                    {chatbot.business.internationalShipping ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex gap-1">
                  <span className="text-muted-foreground whitespace-nowrap">
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
                  <span className="text-muted-foreground whitespace-nowrap">
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
                  <span className="text-muted-foreground whitespace-nowrap">
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
                  <span className="text-muted-foreground whitespace-nowrap">
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
                <span className="text-muted-foreground whitespace-nowrap">
                  Support:
                </span>
                <span
                  title={chatbot.business.supportHours ?? ""}
                  className="line-clamp-1"
                >
                  {chatbot.business.supportHours}
                </span>
              </div>
              <span className="text-muted-foreground">Contact methods:</span>
              <Accordion type="multiple" className="ml-4">
                {chatbot.business.email && (
                  <AccordionItem value="email">
                    <AccordionTrigger className="cursor-pointer">
                      <span>- Email</span>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-1">
                      <div className="flex gap-1">
                        <span className="text-muted-foreground whitespace-nowrap">
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
                {chatbot.business.whatsapp && (
                  <AccordionItem value="whatsapp">
                    <AccordionTrigger className="cursor-pointer">
                      <span>- Whatsapp</span>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-1">
                      <div className="flex gap-1">
                        <span className="text-muted-foreground whitespace-nowrap">
                          Value:{" "}
                        </span>
                        <span
                          className="line-clamp-1"
                          title={chatbot.business.whatsapp}
                        >
                          {chatbot.business.whatsapp}
                        </span>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
                {
                  //TODO: Render the other contact items
                }
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
                <span className="text-muted-foreground whitespace-nowrap">
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
                <span className="text-muted-foreground whitespace-nowrap">
                  Tone:
                </span>
                <span>{chatbot.business.chatbotTone}</span>
              </div>
              <div className="flex gap-1">
                <span className="text-muted-foreground whitespace-nowrap">
                  Style:
                </span>
                <span
                  title={chatbot.business.chatbotStyle}
                  className="line-clamp-1"
                >
                  {chatbot.business.chatbotStyle}
                </span>
              </div>
              <div className="flex gap-1">
                <span className="text-muted-foreground whitespace-nowrap">
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
              {chatbot.files.map((file, i) => (
                <div key={file.id} className="flex gap-1">
                  <span className="text-muted-foreground">File {i + 1}:</span>
                  <span
                    title={chatbot.business.chatbotObjective}
                    className="line-clamp-1"
                  >
                    {file.title}
                  </span>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter>
        <Dialog>
          <Button asChild className="w-full cursor-pointer">
            <DialogTrigger>Add context</DialogTrigger>
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add more context to your chatbot</DialogTitle>
            </DialogHeader>
            <EditContext
              chatbotId={chatbot.id}
              businessId={chatbot.businessId}
            />
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
