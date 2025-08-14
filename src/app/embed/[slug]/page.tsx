import Chat from "@/components/chat";
import { getChatbotBySlugEmbed } from "@/db/chatbot-embed";
import { notFound } from "next/navigation";

export default async function EmbedPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chatbot = await getChatbotBySlugEmbed({ slug });

  if (!chatbot) return notFound();

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
        chatbotIsActive={chatbot.isActive}
        subPlan={chatbot.subscription.plan}
      />
    </div>
  );
}
