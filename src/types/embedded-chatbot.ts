export interface ChatbotStyles {
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  chat: {
    width: number;
    height: number;
    userBgColor: string;
    userTextColor: string;
    botBgColor: string;
    botTextColor: string;
  };
  button: {
    width: number;
    height: number;
    bgColor: string;
    icon: string;
    borderRadius: number;
  };
}