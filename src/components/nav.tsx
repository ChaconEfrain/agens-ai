"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const { isSignedIn } = useUser();
  const pathname = usePathname();

  if (pathname.startsWith("/embed")) return null;

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
      <div className="flex items-center gap-6">
        <ul className="flex gap-1">
          <li>
            <Link
              href="/pricing"
              className="hover:bg-primary hover:text-white transition px-2 py-1 rounded-md"
            >
              Pricing
            </Link>
          </li>
          {isSignedIn && (
            <>
              <li>
                <Link
                  href="/create-chatbot"
                  className="hover:bg-primary hover:text-white transition px-2 py-1 rounded-md"
                >
                  Create chatbot
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:bg-primary hover:text-white transition px-2 py-1 rounded-md"
                >
                  Dashboard
                </Link>
              </li>
            </>
          )}
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
