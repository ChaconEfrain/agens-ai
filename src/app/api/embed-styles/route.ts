import { NextResponse } from "next/server";
import { getChatbotBySlug } from "@/db/chatbot";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Puedes restringir esto a un dominio si prefieres
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json(
      { error: "Chatbot slug is required" },
      { status: 400, headers: corsHeaders }
    );
  }

  const chatbot = await getChatbotBySlug({ slug });

  if (!chatbot) {
    return NextResponse.json(
      { error: "Chatbot not found" },
      { status: 404, headers: corsHeaders }
    );
  }

  return NextResponse.json(chatbot.styles, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
