"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const { isSignedIn } = useUser();
  const pathname = usePathname();

  const [hoverStyle, setHoverStyle] = useState<{
    left: number;
    width: number;
    top: number;
    height: number;
    opacity: number;
  }>({ left: 0, width: 0, top: 0, height: 0, opacity: 0 });

  const containerRef = useRef<HTMLUListElement>(null);

  if (pathname.startsWith("/embed")) return null;

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();

    if (containerRect) {
      setHoverStyle({
        left: rect.left - containerRect.left,
        width: rect.width,
        top: rect.top - containerRect.top,
        height: rect.height,
        opacity: 1,
      });
    }
  };

  const handleMouseLeave = () => {
    setHoverStyle((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <nav className="flex justify-between items-center py-4">
      <Link href="/" className="text-xl flex items-end">
        <img
          src="/chatbot-icon.webp"
          alt="Chatbot with a grey suit and a vintage look"
          className="size-8"
        />
        <div>
          <span>Agens</span>
          <span className="font-bold">AI</span>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <ul
          className="relative flex"
          ref={containerRef}
          onMouseLeave={handleMouseLeave}
        >
          <span
            className="absolute rounded-md bg-accent transition-all duration-500 ease-in-out"
            style={{
              left: hoverStyle.left,
              width: hoverStyle.width,
              top: hoverStyle.top,
              height: hoverStyle.height,
              opacity: hoverStyle.opacity,
            }}
          />
          <li>
            <Link
              href="/pricing"
              onMouseEnter={handleMouseEnter}
              className="relative z-10 px-2 py-1 rounded-md"
            >
              Pricing
            </Link>
          </li>
          <li>
            <Link
              href="/create-chatbot"
              onMouseEnter={handleMouseEnter}
              className="relative z-10 px-2 py-1 rounded-md"
            >
              Create chatbot
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard"
              onMouseEnter={handleMouseEnter}
              className="relative z-10 px-2 py-1 rounded-md"
            >
              Dashboard
            </Link>
          </li>
        </ul>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <Button asChild>
            <SignInButton mode="modal">Sign in</SignInButton>
          </Button>
        </SignedOut>
      </div>
    </nav>
  );
}
