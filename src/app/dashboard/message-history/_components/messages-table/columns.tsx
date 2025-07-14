"use client"

import { Button } from "@/components/ui/button"
import { Chatbot, Message } from "@/db/schema"
import { Prettify } from "@/types/helpers"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import RowMenu from "./row-menu";

export const columns: ColumnDef<Prettify<Message & { chatbot: Chatbot }>>[] = [
  {
    accessorKey: "chatbot.slug",
    id: "chatbot",
    header: "Chatbot",
  },
  {
    accessorKey: "message",
    id: "user message",
    header: "User Message",
  },
  {
    accessorKey: "response",
    id: "ai response",
    header: "AI Response",
    cell: ({ getValue }) => {
      const response = getValue() as string;
      return (
        <div title={response} className="w-full line-clamp-1 text-wrap">
          {response}
        </div>
      );
    },
  },
  {
    accessorKey: "liked",
    id: "rating",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Rating
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ getValue }) => {
      const liked = getValue() as boolean;
      return liked === true
        ? "Liked"
        : liked === false
        ? "Disliked"
        : "No rating";
    },
  },
  {
    accessorKey: "createdAt",
    id: "Date",
    header: "Date",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string).toLocaleString();
      return <div suppressHydrationWarning>{date}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <RowMenu
          sessionId={row.original.sessionId}
          chatbot={row.original.chatbot}
        />
      );
    },
  },
];