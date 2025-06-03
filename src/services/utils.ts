import PdfParse from "pdf-parse";
import createDOMPurify, { WindowLike } from "dompurify";
import { JSDOM } from "jsdom";

export async function extractTextFromPdf({ fileUrl }: { fileUrl: string }) {
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error("file");
  }

  // Convertir el archivo descargado en un buffer
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Analizar el PDF
  const pdfData = await PdfParse(buffer);

  // Usar el texto extraído del PDF
  const fullText = pdfData.text;

  return fullText;
}

const window = new JSDOM("").window as unknown as WindowLike;
const DOMPurify = createDOMPurify(window);

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
      "xlink:href",
      "style",
    ],
  });
}
