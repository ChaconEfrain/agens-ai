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
  Legend,
} from "recharts"

interface Props {
  messagesPerDay: {
    date: string
    chatbotSlug: string
    messages: number
  }[];
  chatbots: string[]
}

export default function MessagesPerChatbotChart({ messagesPerDay, chatbots }: Props) {
  const groupedData: Record<string, Record<string, number>> = {}

  messagesPerDay.forEach(({ date, chatbotSlug, messages }) => {
    if (!groupedData[date]) groupedData[date] = {}
    groupedData[date][chatbotSlug] = messages
  })

  const chartData = Object.entries(groupedData).map(([date, bots]) => {
    const entry: Record<string, any> = { date }
    chatbots.forEach(slug => {
      entry[slug] = bots[slug] || 0
    })
    return entry
  })

  const colors = [
    "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" fontSize={12} />
        <YAxis allowDecimals={false} fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: "oklch(0.21 0.006 285.885)",
            borderRadius: "8px",
            border: "none",
          }}
          labelStyle={{ color: "#f3f4f6" }}
          itemStyle={{ color: "#f3f4f6" }}
        />
        <Legend />
        {chatbots.map((slug, i) => (
          <Line
            key={slug}
            type="monotone"
            dataKey={slug}
            stroke={colors[i % colors.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
