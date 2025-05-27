import PdfParse from "pdf-parse";

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