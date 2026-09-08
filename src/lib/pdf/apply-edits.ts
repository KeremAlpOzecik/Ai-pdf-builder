import { PDFDocument } from "pdf-lib";
import { embedUiFont, rgbFromCss } from "@/lib/pdf/ops";
import type { PdfTextBox } from "@/lib/pdf/text-layer";

export type TextEdit = {
  id: string;
  text: string;
};

export async function applyTextEdits(
  original: ArrayBuffer | Uint8Array,
  boxes: PdfTextBox[],
  edits: Record<string, string>,
) {
  const pdf = await PDFDocument.load(original);
  const font = await embedUiFont(pdf);
  const pages = pdf.getPages();

  for (const box of boxes) {
    const next = edits[box.id];
    if (next === undefined || next === box.text) continue;
    const page = pages[box.pageIndex];
    if (!page) continue;
    const padX = 1.4;
    const padY = Math.max(1.2, box.fontSize * 0.22);
    const coverW = Math.max(
      box.pdfW,
      font.widthOfTextAtSize(box.text || " ", box.fontSize),
    );
    page.drawRectangle({
      x: box.pdfX - padX,
      y: box.pdfY - padY,
      width: coverW + padX * 2,
      height: box.pdfH + padY * 1.15,
      color: rgbFromCss(...box.bg),
    });
    if (next.trim()) {
      page.drawText(next, {
        x: box.pdfX,
        y: box.pdfY,
        size: box.fontSize,
        font,
        color: rgbFromCss(...box.color),
      });
    }
  }

  return pdf.save();
}
