import { ChatbotStyles } from "@/types/embedded-chatbot";

export const DEFAULT_STYLES: ChatbotStyles = {
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
    icon: "<svg width='64px' height='64px' viewBox='-6.4 -6.4 28.80 28.80' fill='#ffffff' stroke='#ffffff' stroke-width='0.00016'><g id='SVGRepo_bgCarrier' stroke-width='0'></g><g id='SVGRepo_tracerCarrier' stroke-linecap='round' stroke-linejoin='round' stroke='#CCCCCC' stroke-width='0.096'></g><g id='SVGRepo_iconCarrier'><path fill-rule='evenodd' clip-rule='evenodd' d='M8.48 4h4l.5.5v2.03h.52l.5.5V8l-.5.5h-.52v3l-.5.5H9.36l-2.5 2.76L6 14.4V12H3.5l-.5-.64V8.5h-.5L2 8v-.97l.5-.5H3V4.36L3.53 4h4V2.86A1 1 0 0 1 7 2a1 1 0 0 1 2 0 1 1 0 0 1-.52.83V4zM12 8V5H4v5.86l2.5.14H7v2.19l1.8-2.04.35-.15H12V8zm-2.12.51a2.71 2.71 0 0 1-1.37.74v-.01a2.71 2.71 0 0 1-2.42-.74l-.7.71c.34.34.745.608 1.19.79.45.188.932.286 1.42.29a3.7 3.7 0 0 0 2.58-1.07l-.7-.71zM6.49 6.5h-1v1h1v-1zm3 0h1v1h-1v-1z'></path></g></svg>",
    borderRadius: 30,
  },
};