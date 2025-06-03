import { NextResponse } from "next/server";
import { getChatbotBySlug } from "@/db/chatbot";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Chatbot slug is required" }, { status: 400 });
  }

  const chatbot = await getChatbotBySlug({ slug });

  if (!chatbot) {
    return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
  }

  return NextResponse.json(chatbot.styles);
}
