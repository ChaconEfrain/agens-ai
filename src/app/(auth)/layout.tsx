import { ClerkProvider } from "@clerk/nextjs";
import Nav from "@/components/nav";
import { Toaster } from "@/components/ui/sonner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <div className="max-w-7xl mx-auto px-4 font-outfit">
        <Nav />
        {children}
      </div>
      <Toaster position="bottom-right" />
    </ClerkProvider>
  );
}
