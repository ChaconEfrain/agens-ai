import Chat from "@/components/chat";
import { getChatbotBySlug } from "@/db/chatbot";
import { getActiveMessagesByChatbotId } from "@/db/messages";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chatbot = await getChatbotBySlug({ slug });

  if (!chatbot) return notFound();

  const sessionId = (await cookies()).get(`chat-session-${slug}`)?.value;
  const messages = await getActiveMessagesByChatbotId({
    chatbotId: chatbot.id,
    sessionId: sessionId ?? "",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        boxSizing: "border-box",
        fontFamily: "sans-serif",
        overflow: "hidden",
        backgroundColor: "transparent",
        marginLeft: "auto",
        boxShadow: "0 30px 30px rgba(0,0,0,0.15)",
        borderRadius: "16px",
      }}
    >
      <Chat
        chatbotId={chatbot.id}
        chatbotInstructions={chatbot.instructions}
        chatbotSlug={chatbot.slug}
        chatbotStyles={chatbot.styles}
        historyMessages={messages}
      />
    </div>
  );
}
