import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Nav from "@/components/nav";
import { Toaster } from "@/components/ui/sonner";
import AppWrapper from "@/components/app-wrapper";
import NextTopLoader from "nextjs-toploader";
import ChatbotIcon from "@/assets/chatbot-icon.webp";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgensAI - Create a chatbot for your business",
  description:
    "Create, customize, and deploy AI-powered chatbots for your business in minutes. AgensAI helps you train bots with your own data, integrate them into your website, and deliver better customer experiences.",
  icons: {
    icon: ChatbotIcon.src,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${outfit.variable} antialiased bg-transparent`}>
          <NextTopLoader color="#18181b" height={5} showSpinner={false} />
          <AppWrapper>
            <Nav />
            {children}
          </AppWrapper>
          <Toaster position="bottom-right" duration={8000} closeButton />
        </body>
      </html>
    </ClerkProvider>
  );
}
