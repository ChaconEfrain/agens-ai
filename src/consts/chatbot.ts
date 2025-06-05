import { ChatbotStyles } from "@/types/embedded-chatbot";

export const defaultStyles: ChatbotStyles = {
  position: "bottom-right",
  chat: {
    width: 350,
    height: 500,
    userBgColor: "#2b2233",
    userTextColor: "#ffffff",
    botBgColor: "#f3f4f6",
    botTextColor: "#1e2939",
    showBranding: true,
  },
  button: {
    width: 50,
    height: 50,
    bgColor: "#2b2233",
    icon: "",
    borderRadius: 30,
  },
} as const;