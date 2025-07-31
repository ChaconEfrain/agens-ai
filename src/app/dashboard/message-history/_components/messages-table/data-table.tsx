"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { DataTablePagination } from "./data-table-pagination";
import { exportTableToExcel } from "@/lib/utils";
import { getPaginatedMessagesByClerkIdAction } from "../../_actions";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  chatbots: string[];
  clerkId: string;
}

export default function DataTable<TData, TValue>({
  columns,
  chatbots,
  clerkId,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [data, setData] = useState<TData[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    "user message": "",
    "ai response": "",
    chatbot: "",
  });
  const debouncedUserMessage = useDebouncedValue(filters["user message"]);
  const debouncedAIResponse = useDebouncedValue(filters["ai response"]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, total } = await getPaginatedMessagesByClerkIdAction({
        clerkId,
        page,
        pageSize,
        aiResponseFilter: debouncedAIResponse || undefined,
        userMessageFilter: debouncedUserMessage || undefined,
        chatbotSlugFilter: filters.chatbot || undefined,
      });
      if ((data ?? []).length > 0 && total) {
        setData(data as TData[]);
        setTotalPages(Math.ceil(total / pageSize));
      } else {
        setData([]);
        setTotalPages(0);
      }
      setLoading(false);
    })();
  }, [
    page,
    pageSize,
    debouncedUserMessage,
    debouncedAIResponse,
    filters.chatbot,
  ]);

  return (
    <Card className="min-h-[600px]">
      <CardHeader className="flex flex-col gap-4 mb-4">
        <h2 className="text-2xl font-semibold">All messages</h2>
        <div className="flex justify-between w-full">
          <div className="flex gap-4">
            {table
              .getAllColumns()
              .filter(
                (col) =>
                  ["user message", "ai response"].includes(col.id) &&
                  col.getCanFilter()
              )
              .map((column) => (
                <Input
                  key={column.id}
                  placeholder={`Filter by ${column.id}`}
                  value={filters[column.id as "user message" | "ai response"]}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      [column.id]: e.target.value,
                    }))
                  }
                  className="w-[200px] placeholder:capitalize"
                />
              ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Filter by chatbots
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {chatbots.map((slug) => (
                  <DropdownMenuCheckboxItem
                    key={slug}
                    checked={filters.chatbot === slug}
                    onCheckedChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        chatbot: value ? slug : "",
                      }))
                    }
                  >
                    {slug}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              onClick={() =>
                setFilters({
                  "user message": "",
                  "ai response": "",
                  chatbot: "",
                })
              }
            >
              Clear Filters
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>Export Data</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <button
                    onClick={() =>
                      exportTableToExcel(table, "messages.xlsx", true)
                    }
                    className="w-full text-left"
                  >
                    All data
                  </button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <button
                    onClick={() =>
                      exportTableToExcel(
                        table,
                        `messages-page${
                          table.getState().pagination.pageIndex + 1
                        }.xlsx`
                      )
                    }
                    className="w-full text-left"
                  >
                    This page
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-full">
        {loading && (
          <div
            className="rounded-md border h-[532px] w-full animate-pulse bg-muted-foreground"
            aria-hidden
          ></div>
        )}
        {!loading && (
          <div className="rounded-md border h-full">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <DataTablePagination
        totalPages={totalPages}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
      />
    </Card>
  );
}