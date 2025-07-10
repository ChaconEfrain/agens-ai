import * as XLSX from "xlsx";
import { Table } from "@tanstack/react-table";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import DOMPurify from "dompurify";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeSvg(svgString: string) {
  return DOMPurify.sanitize(svgString, {
    USE_PROFILES: { svg: true },
    FORBID_TAGS: ["script", "style"],
    FORBID_ATTR: [
      "onerror",
      "onload",
      "onclick",
      "onmouseover",
      "xmlns:xlink",
      "xmlns",
      "xlink:href",
      "style",
    ],
  });
}

export function exportToExcel<T>(
  table: Table<T>,
  fileName: string,
  exportAll: boolean = false
) {
  const rows = exportAll
    ? table.getCoreRowModel().rows
    : table.getRowModel().rows;

  const visibleColumns = table.getVisibleLeafColumns();

  const data = rows.map((row) => {
    const rowData: Record<string, any> = {};
    visibleColumns.forEach((column) => {
      const cell = row.getAllCells().find((c) => c.column.id === column.id);
      if (!cell) return;
      if (column.id === "rating") {
        const value = cell.getValue();
        if (value === true) {
          rowData[column.id] = "Liked";
        } else if (value === false) {
          rowData[column.id] = "Disliked";
        } else {
          rowData[column.id] = "No rating";
        }
      } else {
        rowData[column.id] = cell.getValue();
      }
    });
    return rowData;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "messages");

  XLSX.writeFile(workbook, fileName);
}
