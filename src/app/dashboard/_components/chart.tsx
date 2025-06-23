'use client'

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  messagesPerDay: {
    date: string;
    messages: number
  }[]
}

export default function Chart({messagesPerDay}: Props) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={messagesPerDay} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" fontSize={12} />
        <YAxis allowDecimals={false} fontSize={12} />
        <Tooltip
          contentStyle={{ backgroundColor: "oklch(0.21 0.006 285.885)", borderRadius: "8px", border: "none" }}
          labelStyle={{ color: "#f3f4f6" }}
          itemStyle={{ color: "#f3f4f6" }}
        />
        <Line
          type="monotone"
          dataKey="messages"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
