import { degrees, PDFDocument, rgb } from "pdf-lib";
import { applyTextEdits } from "@/lib/pdf/apply-edits";
import { embedUiFont } from "@/lib/pdf/ops";
import type { UiFontVariant } from "@/lib/pdf/editor-fonts";
import type { PdfCanvasElement } from "@/lib/pdf/canvas-types";
import type { PdfTextBox } from "@/lib/pdf/text-layer";
import { layoutTextLines } from "@/lib/pdf/text-layout";

function hexToRgb(value: string) {
  const hex = value.replace("#", "");
  const normalized = hex.length === 3 ? hex.split("").map((part) => part + part).join("") : hex;
  const number = Number.parseInt(normalized, 16);
  if (!Number.isFinite(number)) return rgb(0.1, 0.1, 0.1);
  return rgb(((number >> 16) & 255) / 255, ((number >> 8) & 255) / 255, (number & 255) / 255);
}

function dataUrlBytes(dataUrl: string) {
  const [, base64 = ""] = dataUrl.split(",", 2);
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export async function exportCanvasPdf(
  original: Uint8Array,
  boxes: PdfTextBox[],
  edits: Record<string, string>,
  elements: PdfCanvasElement[],
) {
  const editedBytes = await applyTextEdits(original, boxes, edits);
  const pdf = await PDFDocument.load(editedBytes);
  const fonts = new Map<UiFontVariant, Awaited<ReturnType<typeof embedUiFont>>>();
  async function getFont(variant: UiFontVariant) {
    const existing = fonts.get(variant);
    if (existing) return existing;
    const embedded = await embedUiFont(pdf, variant);
    fonts.set(variant, embedded);
    return embedded;
  }
  const pages = pdf.getPages();

  for (const element of elements) {
    const page = pages[element.pageIndex];
    if (!page) continue;
    const pageSize = page.getSize();
    const x = element.x * pageSize.width;
    const width = element.width * pageSize.width;
    const height = element.height * pageSize.height;
    const y = pageSize.height - element.y * pageSize.height - height;
    const rotate = degrees(-element.rotation);

    if (element.type === "text") {
      const variant: UiFontVariant = element.bold && element.italic ? "boldItalic" : element.bold ? "bold" : element.italic ? "italic" : "regular";
      const font = await getFont(variant);
      const size = Math.max(4, element.fontSize);
      const lineHeight = size * (element.lineHeight ?? 1.25);
      const lines = layoutTextLines(element.text, width, height, size, element.lineHeight ?? 1.25, (text) => font.widthOfTextAtSize(text, size));
      lines.forEach((line, index) => {
        const textWidth = line.width;
        const offset = element.align === "center" ? (width - textWidth) / 2 : element.align === "right" ? width - textWidth : 0;
        const localX = x + Math.max(0, offset);
        const localY = y + height - size - index * lineHeight;
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const angle = (-element.rotation * Math.PI) / 180;
        const rotatedX = centerX + (localX - centerX) * Math.cos(angle) - (localY - centerY) * Math.sin(angle);
        const rotatedY = centerY + (localX - centerX) * Math.sin(angle) + (localY - centerY) * Math.cos(angle);
        page.drawText(line.text, { x: rotatedX, y: rotatedY, size, font, color: hexToRgb(element.color), opacity: element.opacity, rotate });
      });
      continue;
    }

    if (element.type === "image") {
      const bytes = dataUrlBytes(element.dataUrl);
      const image = element.dataUrl.startsWith("data:image/png") ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
      const angle = (-element.rotation * Math.PI) / 180;
      const drawX = x + width / 2 - (width / 2) * Math.cos(angle) + (height / 2) * Math.sin(angle);
      const drawY = y + height / 2 - (width / 2) * Math.sin(angle) - (height / 2) * Math.cos(angle);
      page.drawImage(image, { x: drawX, y: drawY, width, height, opacity: element.opacity, rotate });
      continue;
    }

    if (element.shape === "ellipse") {
      page.drawEllipse({ x: x + width / 2, y: y + height / 2, xScale: width / 2, yScale: height / 2, color: hexToRgb(element.fill), borderColor: hexToRgb(element.stroke), borderWidth: element.strokeWidth, opacity: element.opacity, borderOpacity: element.opacity });
    } else if (element.shape === "line") {
      const angle = (-element.rotation * Math.PI) / 180;
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      const dx = (width / 2) * Math.cos(angle);
      const dy = (width / 2) * Math.sin(angle);
      page.drawLine({ start: { x: centerX - dx, y: centerY - dy }, end: { x: centerX + dx, y: centerY + dy }, thickness: element.strokeWidth, color: hexToRgb(element.stroke), opacity: element.opacity });
    } else {
      const angle = (-element.rotation * Math.PI) / 180;
      const drawX = x + width / 2 - (width / 2) * Math.cos(angle) + (height / 2) * Math.sin(angle);
      const drawY = y + height / 2 - (width / 2) * Math.sin(angle) - (height / 2) * Math.cos(angle);
      page.drawRectangle({ x: drawX, y: drawY, width, height, color: hexToRgb(element.fill), borderColor: hexToRgb(element.stroke), borderWidth: element.strokeWidth, opacity: element.opacity, borderOpacity: element.opacity, rotate });
    }
  }

  return pdf.save();
}
