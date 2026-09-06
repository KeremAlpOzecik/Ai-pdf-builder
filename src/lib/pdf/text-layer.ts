import { loadPdfjs } from "@/lib/pdf/pdfjs-client";

export type PdfTextBox = {
  id: string;
  pageIndex: number;
  text: string;
  pdfX: number;
  pdfY: number;
  pdfW: number;
  pdfH: number;
  fontSize: number;
  bg: [number, number, number];
};

type PdfStrItem = {
  str: string;
  transform: number[];
  width: number;
  height?: number;
  fontName?: string;
};

function isPdfTextItem(item: unknown): item is PdfStrItem {
  if (typeof item !== "object" || item === null || !("str" in item)) return false;
  const record = item as { str: unknown; transform?: { length?: number } };
  if (typeof record.str !== "string") return false;
  const len = record.transform && typeof record.transform === "object" ? Number(record.transform.length) : 0;
  return Array.isArray(record.transform) || len >= 6;
}

export async function extractTextBoxes(
  page: import("pdfjs-dist").PDFPageProxy,
  canvas: HTMLCanvasElement,
  viewport: import("pdfjs-dist").PageViewport,
): Promise<PdfTextBox[]> {
  const pdfjs = await loadPdfjs();
  const content = await page.getTextContent();
  const ctx = canvas.getContext("2d");
  const sx = canvas.width / viewport.width;
  const sy = canvas.height / viewport.height;
  const boxes: PdfTextBox[] = [];
  let index = 0;

  for (const raw of content.items as unknown[]) {
    if (!isPdfTextItem(raw)) continue;
    const pdfTx = Array.from(raw.transform);
    const [, , , , pdfX, pdfY] = pdfTx;
    const fontSize = Math.hypot(pdfTx[2], pdfTx[3]) || Math.abs(pdfTx[3]) || 11;
    const m = pdfjs.Util.transform(viewport.transform, pdfTx);
    const viewH = Math.hypot(m[2], m[3]) || fontSize * viewport.scale;
    const viewW = raw.width * viewport.scale;
    const left = m[4];
    const top = m[5] - viewH;
    boxes.push({
      id: `${page.pageNumber - 1}-${index}`,
      pageIndex: page.pageNumber - 1,
      text: raw.str,
      pdfX,
      pdfY,
      pdfW: raw.width,
      pdfH: fontSize,
      fontSize,
      bg: samplePaper(ctx, left * sx, top * sy, viewW * sx, viewH * sy),
    });
    index += 1;
  }

  return boxes;
}

function samplePaper(
  ctx: CanvasRenderingContext2D | null,
  left: number,
  top: number,
  width: number,
  height: number,
): [number, number, number] {
  if (!ctx) return [255, 255, 255];
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const probes: [number, number][] = [
    [left - 3, top + height / 2],
    [left + width + 3, top + height / 2],
    [left + 4, top - 3],
    [left + width / 2, top - 3],
    [left + 4, top + height + 3],
  ];
  let best: [number, number, number] = [255, 255, 255];
  let bestLum = -1;
  for (const [px, py] of probes) {
    const x = Math.min(w - 1, Math.max(0, Math.round(px)));
    const y = Math.min(h - 1, Math.max(0, Math.round(py)));
    try {
      const d = ctx.getImageData(x, y, 1, 1).data;
      const lum = (d[0] * 299 + d[1] * 587 + d[2] * 114) / 1000;
      if (lum < 42) continue;
      if (lum > bestLum) {
        bestLum = lum;
        best = [d[0], d[1], d[2]];
      }
    } catch {
      /* tainted */
    }
  }
  return bestLum >= 0 ? best : [255, 255, 255];
}
