'use client'

import React, { useEffect, useState } from 'react'

export default function CurrentPeriodDate({start, end}: {start: Date; end: Date}) {
  const [dates, setDates] = useState({start: '', end: ''});
  useEffect(() => {
    setDates({
      start: new Date(start).toLocaleDateString(),
      end: new Date(end).toLocaleDateString()
    })
  }, [])
  return (
    <p>Showing messages between {dates.start} and {dates.end}</p>
  )
}
