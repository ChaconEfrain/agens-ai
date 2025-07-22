'use client'

import React, { useEffect, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getCurrentPeriodMessagesPerDayByClerkIdAction } from "../_actions";
import Banner from "@/components/banner";

interface Props {
  messagesPerDay:
    | {
        date: string;
        messages: number;
      }[]
    | null;
  clerkId: string;
}

export default function CurrentPeriodChart({ messagesPerDay, clerkId }: Props) {
  const [data, setData] = useState<Props["messagesPerDay"]>(messagesPerDay);
  const isFetching = useRef(false);

  useEffect(() => {
    const getCurrentPeriodMessages = async () => {
      if (isFetching.current) return;

      isFetching.current = true;
      const messages = await getCurrentPeriodMessagesPerDayByClerkIdAction({
        clerkId,
      });

      if (!messages) {
        isFetching.current = false;
        return;
      }

      setData(messages);
      isFetching.current = false;
    };

    const interval = setInterval(getCurrentPeriodMessages, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return data && data.length > 0 ? (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
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
  ) : (
    <Banner
      bannerMessage="No messages have been recorded for this period"
      className="py-12"
    />
  );
}
