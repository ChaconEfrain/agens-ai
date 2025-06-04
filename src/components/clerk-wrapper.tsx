'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import React from 'react'

export default function ClerkWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith('/embed')) return <>{children}</>;

  return (
    <ClerkProvider>{children}</ClerkProvider>
  )
}
