'use client'

import React, { useEffect, useState } from 'react'

export default function ClientDate({
  date,
}: {
  date: Date;
}) {
  const [localeDate, setLocaleDate] = useState("");
  useEffect(() => {
    setLocaleDate(date.toLocaleString());
  }, []);
  return (
    <>
      {localeDate}
    </>
  );
}
