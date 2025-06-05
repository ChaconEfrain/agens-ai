import { sendMessageAction } from "@/actions/chatbot-messages";
import { getChatbotByIdEmbed } from "@/db/chatbot-embed";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_HEADERS = {
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function POST(req: NextRequest) {
  const referer = req.headers.get("referer") ?? "";

  if (!referer) {
    return NextResponse.json({ error: "Unknown domain" }, { status: 403, headers: { ...DEFAULT_HEADERS, "Access-Control-Allow-Origin": "*" } });
  }

  const originDomain = new URL(referer).hostname.replace(/^www\./, "");

  const { message, chatbotId, chatbotInstructions, sessionId } = await req.json();

  const chatbot = await getChatbotByIdEmbed({id: Number(chatbotId)});

  if (!chatbot) {
    return NextResponse.json({ error: "Chatbot not found" }, { status: 404, headers: { ...DEFAULT_HEADERS, "Access-Control-Allow-Origin": "*" } });
  }

  const isAllowed = chatbot.allowedDomains.some((d: string) => originDomain === d);

  if (!isAllowed) {
    return NextResponse.json({ error: "Domain not allowed" }, { status: 403, headers: { ...DEFAULT_HEADERS, "Access-Control-Allow-Origin": "*" } });
  }

  const corsHeaders = {
    ...DEFAULT_HEADERS,
    "Access-Control-Allow-Origin": `https://${originDomain}`,
  };

  const response = await sendMessageAction({
    message,
    chatbotId: Number(chatbotId),
    chatbotInstructions,
    sessionId,
  });

  return NextResponse.json({ message: response }, {status: 200, headers: corsHeaders});
}
