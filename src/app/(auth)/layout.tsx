import { ClerkProvider } from "@clerk/nextjs";
import Nav from "@/components/nav";
import AppWrapper from "@/components/app-wrapper";
import { Toaster } from "@/components/ui/sonner";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <AppWrapper>
        <Nav />
        {children}
      </AppWrapper>
      <Toaster position="bottom-right" />
    </ClerkProvider>
  );
}
