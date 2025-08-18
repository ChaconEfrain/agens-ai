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
        <ul className="flex gap-4">
          <li>Pricing</li>
          <li>About</li>
          <li>Contact</li>
          {isSignedIn && (
            <>
              <li>
                <Link href="/create-chatbot">Create chatbot</Link>
              </li>
              <li>
                <Link href="/dashboard">Dashboard</Link>
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
