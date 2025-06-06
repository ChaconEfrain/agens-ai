'use client'

import { usePathname } from 'next/navigation'
import React from 'react'

export default function AppWrapper({children}: {children: React.ReactNode}) {
  const pathname = usePathname();

  if (pathname.startsWith('/embed')) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 font-outfit">
      {children}
    </div>
  )
}
