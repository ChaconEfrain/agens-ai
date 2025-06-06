'use client'

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import React from "react";

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div
      className={cn({
        "max-w-7xl mx-auto px-4 font-outfit": !pathname.startsWith("/embed"),
      })}
    >
      {children}
    </div>
  );
}
