'use client'

import Banner from "@/components/banner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Props {
  conversationsPerDay: {
    date: string;
    chatbotSlug: string;
    conversations: number;
  }[];
  chatbots: string[];
}

export default function ConversationsPerChatbotChart({
  conversationsPerDay,
  chatbots,
}: Props) {
  const grouped: Record<string, Record<string, number>> = {};

  conversationsPerDay.forEach(({ date, chatbotSlug, conversations }) => {
    if (!grouped[date]) grouped[date] = {};
    grouped[date][chatbotSlug.split("-")[0]] = conversations;
  });

  const chartData = Object.entries(grouped).map(([date, slugs]) => {
    const entry: Record<string, any> = { date };
    chatbots.forEach((slug) => {
      entry[slug.split("-")[0]] = slugs[slug.split("-")[0]] || 0;
    });
    return entry;
  });

  const colors = [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#3b82f6",
    "#8b5cf6",
  ];

  return chartData.length > 0 ? (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
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
          <Bar
            key={slug}
            dataKey={slug.split("-")[0]}
            fill={colors[i % colors.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  ) : (
    <Banner
      bannerMessage="There aren't any conversations yet"
      className="py-12 min-h-[300px]"
    />
  );
}
