import * as XLSX from "xlsx";
import { Table } from "@tanstack/react-table";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Message } from "@/db/schema";
import { FormWizardData } from "@/app/create-chatbot/_components/form-wizard";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeFormChunks(form: FormWizardData) {
  const chunks: string[] = [];

  // General Info
  const { businessName, description, allowedWebsites, foundedYear } =
    form.generalInfo;
  chunks.push(
    `The business is called ${businessName} and was founded in ${foundedYear}.`,
    allowedWebsites.length > 1
      ? `Its websites are ${allowedWebsites.map(({ url }) => url).join(", ")}.`
      : "Its website is " + allowedWebsites[0].url,
    description ? `Business description: ${description}` : ""
  );

  // Products & Services
  if (form.productsServices?.type === "products") {
    const items = form.productsServices.items ?? [];
    const itemDescriptions = items.map(
      (item: any) =>
        `Product: "${item.name}", Description: ${item.description}, Price: ${item.price}`
    );
    chunks.push(
      `The business offers the following products:\n${itemDescriptions.join(
        "\n"
      )}`
    );
  } else if (form.productsServices?.type === "services") {
    const items = form.productsServices.items ?? [];
    const itemDescriptions = items.map(
      (item: any) =>
        `Service: "${item.name}", Description: ${item.description}, Price: ${item.price}`
    );
    chunks.push(
      `The business offers the following services:\n${itemDescriptions.join(
        "\n"
      )}`
    );
  }

  // Shipping
  if (form.hasPhysicalProducts) {
    const logistics = form.shippingLogistics;
    if (logistics) {
      const details = Object.entries(logistics)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
      chunks.push(`Shipping logistics details: ${details}`);
    }
  }

  // Customer Service
  const cs = form.customerService;
  if (cs) {
    chunks.push(
      `Customer support is available ${cs.supportHours}.`,
      `Contact methods: ${cs.contactMethods}.`,
      cs.email ? `Email: ${cs.email}` : "",
      cs.phone ? `Phone: ${cs.phone}` : "",
      cs.whatsapp ? `WhatsApp: ${cs.whatsapp}` : "",
      cs.socialMedia ? `Social media: ${cs.socialMedia}` : "",
      `Typical response time: ${cs.responseTime}`
    );

    const faq = cs.commonQuestions ?? [];
    for (const { question, answer } of faq) {
      chunks.push(`Customer FAQ - Q: "${question}" A: "${answer}"`);
    }
  }

  return chunks.filter(Boolean); // removes empty strings
}

export function exportTableToExcel<T>(
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

export function exportConversationToExcel(conversation: Message[]) {
  const data = conversation.map((message) => ({
    "User Message": message.message,
    Response: message.response,
    Rating:
      message.liked === true
        ? "Liked"
        : message.liked === false
        ? "Disliked"
        : "No rating",
    Date: message.createdAt ? new Date(message.createdAt).toLocaleString() : "",
  }));
  const fileName = "conversation.xlsx";

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "messages");

  XLSX.writeFile(workbook, fileName);
}

export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (error) {
    return false;
  }
}

export function getPaginationParams(page: number, pageSize: number) {
  const offset = page * pageSize;
  return { offset, limit: pageSize };
}
