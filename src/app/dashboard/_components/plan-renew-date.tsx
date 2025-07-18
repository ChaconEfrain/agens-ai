'use client'

import React, { useEffect, useState } from 'react'

export default function PlanRenewDate({date}: {date: Date}) {
  const [localeDate, setLocaleDate] = useState('');
  useEffect(() => {
    setLocaleDate(new Date(date).toLocaleString());
  }, [])
  return (
    <p className="text-muted-foreground">
      Your plan will renew on {localeDate}
    </p>
  )
}
