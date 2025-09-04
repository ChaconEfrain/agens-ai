import { NextRequest, NextResponse } from "next/server";
import { getChatbotBySlugEmbed } from "@/db/chatbot-embed";
import jwt from "jsonwebtoken";

const DEFAULT_HEADERS = {
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const JWT_SECRET = process.env.JWT_SECRET!;
const IS_DEV = process.env.NODE_ENV === "development";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json(
      { error: "Chatbot slug is required" },
      {
        status: 400,
        headers: { ...DEFAULT_HEADERS, "Access-Control-Allow-Origin": "*" },
      }
    );
  }

  const originHeader = req.headers.get("origin");
  const refererHeader = req.headers.get("referer");

  let originDomain = "";
  if (originHeader) {
    originDomain = new URL(originHeader).hostname.replace(/^www\./, "");
  } else if (refererHeader) {
    originDomain = new URL(refererHeader).hostname.replace(/^www\./, "");
  }

  if (!originDomain) {
    return NextResponse.json(
      { error: "Unknown domain" },
      {
        status: 403,
        headers: { ...DEFAULT_HEADERS, "Access-Control-Allow-Origin": "*" },
      }
    );
  }

  const chatbot = await getChatbotBySlugEmbed({ slug });

  if (!chatbot) {
    return NextResponse.json(
      { error: "Chatbot not found" },
      {
        status: 404,
        headers: { ...DEFAULT_HEADERS, "Access-Control-Allow-Origin": "*" },
      }
    );
  }

  if (!chatbot.allowedDomains.includes(originDomain) && !IS_DEV) {
    return NextResponse.json(
      { error: `Access from domain '${originDomain}' is not allowed` },
      {
        status: 403,
        headers: { ...DEFAULT_HEADERS, "Access-Control-Allow-Origin": "*" },
      }
    );
  }

  if (!chatbot.isActive) {
    return NextResponse.json(
      { error: `Chatbot '${slug}' is inactive` },
      {
        status: 403,
        headers: {
          ...DEFAULT_HEADERS,
          "Access-Control-Allow-Origin": `https://${originDomain}`,
        },
      }
    );
  }

  const token = jwt.sign(
    {
      chatbotId: chatbot.id,
      domain: originDomain,
      slug,
    },
    JWT_SECRET
  );

  const corsHeaders = {
    ...DEFAULT_HEADERS,
    "Access-Control-Allow-Origin": `https://${originDomain}`,
  };

  return NextResponse.json(
    { styles: chatbot.styles, token },
    {
      status: 200,
      headers: corsHeaders,
    }
  );
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "*";

  return new NextResponse(null, {
    status: 204,
    headers: {
      ...DEFAULT_HEADERS,
      "Access-Control-Allow-Origin": origin,
    },
  });
}

