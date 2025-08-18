import { cn } from "@/lib/utils";
import React from "react";

export default function Banner({
  bannerMessage,
  className,
}: {
  bannerMessage: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 items-center justify-center",
        className
      )}
    >
      <img
        src="/chatbot-icon.webp"
        alt="Chatbot with a grey suit and a vintage look"
        className="size-20"
      />
      <p className="text-lg text-muted-foreground font-medium">
        {bannerMessage}
      </p>
    </div>
  );
}
