import { ChatbotStyles } from "@/types/embedded-chatbot";
import ChatbotIcon from "@/assets/chatbot-icon.webp";

export const DEFAULT_STYLES: ChatbotStyles = {
  position: "bottom-right",
  chat: {
    width: 350,
    height: 500,
    userBgColor: "#2b2233",
    userTextColor: "#ffffff",
    botBgColor: "#f3f4f6",
    botTextColor: "#1e2939",
  },
  button: {
    width: 50,
    height: 50,
    bgColor: "#2b2233",
    icon: ChatbotIcon.src,
    borderRadius: 30,
  },
};