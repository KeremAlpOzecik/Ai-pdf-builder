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
  color: [number, number, number];
  fontFamily: string;
  viewLeft: number;
  viewTop: number;
  viewWidth: number;
  viewHeight: number;
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
  const styles = content.styles as Record<string, { fontFamily?: string }>;
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
    const bg = samplePaper(ctx, left * sx, top * sy, viewW * sx, viewH * sy);
    boxes.push({
      id: `${page.pageNumber - 1}-${index}`,
      pageIndex: page.pageNumber - 1,
      text: raw.str,
      pdfX,
      pdfY,
      pdfW: raw.width,
      pdfH: fontSize,
      fontSize,
      bg,
      color: sampleTextColor(ctx, left * sx, top * sy, viewW * sx, viewH * sy, bg),
      fontFamily: (raw.fontName && styles[raw.fontName]?.fontFamily) || "sans-serif",
      viewLeft: left,
      viewTop: top,
      viewWidth: viewW,
      viewHeight: viewH,
    });
    index += 1;
  }

  return boxes;
}

function sampleTextColor(
  ctx: CanvasRenderingContext2D | null,
  left: number,
  top: number,
  width: number,
  height: number,
  bg: [number, number, number],
): [number, number, number] {
  if (!ctx || width < 1 || height < 1) return [28, 25, 23];
  const x = Math.max(0, Math.floor(left));
  const y = Math.max(0, Math.floor(top));
  const w = Math.min(ctx.canvas.width - x, Math.max(1, Math.ceil(width)));
  const h = Math.min(ctx.canvas.height - y, Math.max(1, Math.ceil(height)));
  if (w <= 0 || h <= 0) return [28, 25, 23];
  try {
    const pixels = ctx.getImageData(x, y, w, h).data;
    const buckets = new Map<string, { count: number; rgb: [number, number, number] }>();
    for (let i = 0; i < pixels.length; i += 16) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const distance = Math.hypot(r - bg[0], g - bg[1], b - bg[2]);
      if (distance < 48) continue;
      const key = `${Math.round(r / 24)}-${Math.round(g / 24)}-${Math.round(b / 24)}`;
      const found = buckets.get(key);
      if (found) found.count += 1;
      else buckets.set(key, { count: 1, rgb: [r, g, b] });
    }
    const best = [...buckets.values()].sort((a, b) => b.count - a.count)[0];
    return best?.rgb ?? [28, 25, 23];
  } catch {
    return [28, 25, 23];
  }
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
