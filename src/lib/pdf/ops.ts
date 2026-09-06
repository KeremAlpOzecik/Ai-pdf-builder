import { PDFDocument, rgb } from "pdf-lib";
import { openPdf, renderPageToCanvas } from "@/lib/pdf/pdfjs-client";

let fontBytesPromise: Promise<ArrayBuffer> | null = null;

export async function loadUiFontBytes() {
  fontBytesPromise ??= fetch("/fonts/NotoSans-Regular.ttf").then((res) => {
    if (!res.ok) throw new Error("Font missing");
    return res.arrayBuffer();
  });
  return fontBytesPromise;
}

export async function embedUiFont(pdf: PDFDocument) {
  try {
    const fontkitMod = await import("@pdf-lib/fontkit");
    const fontkit =
      "default" in fontkitMod && fontkitMod.default
        ? fontkitMod.default
        : fontkitMod;
    pdf.registerFontkit(fontkit);
    const bytes = await loadUiFontBytes();
    return pdf.embedFont(bytes, { subset: true });
  } catch {
    const { StandardFonts } = await import("pdf-lib");
    return pdf.embedFont(StandardFonts.Helvetica);
  }
}

export async function mergePdfs(files: File[]) {
  const out = await PDFDocument.create();
  for (const file of files) {
    const src = await PDFDocument.load(await file.arrayBuffer());
    const pages = await out.copyPages(src, src.getPageIndices());
    for (const page of pages) out.addPage(page);
  }
  return out.save();
}

export async function splitPdf(file: File, from: number, to: number) {
  const src = await PDFDocument.load(await file.arrayBuffer());
  const count = src.getPageCount();
  const start = Math.max(1, Math.min(from, count));
  const end = Math.max(start, Math.min(to, count));
  const out = await PDFDocument.create();
  const pages = await out.copyPages(
    src,
    Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i),
  );
  for (const page of pages) out.addPage(page);
  return out.save();
}

export async function compressPdf(file: File, quality = 0.62) {
  const data = await file.arrayBuffer();
  const doc = await openPdf(data);
  const out = await PDFDocument.create();
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const canvas = await renderPageToCanvas(page, 1.35);
    const jpeg = await canvasToJpeg(canvas, quality);
    const image = await out.embedJpg(jpeg);
    const pdfPage = out.addPage([image.width, image.height]);
    pdfPage.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }
  return out.save();
}

export async function imagesToPdf(files: File[]) {
  const out = await PDFDocument.create();
  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const png = file.type.includes("png") || file.name.toLowerCase().endsWith(".png");
    const webp = file.type.includes("webp") || file.name.toLowerCase().endsWith(".webp");
    if (webp) {
      const jpeg = await rasterToJpeg(file, 0.92);
      const image = await out.embedJpg(jpeg);
      const page = out.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      continue;
    }
    const image = png ? await out.embedPng(bytes) : await out.embedJpg(bytes);
    const page = out.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }
  return out.save();
}

export async function pdfToJpegs(file: File, quality = 0.9) {
  const doc = await openPdf(await file.arrayBuffer());
  const blobs: { blob: Blob; name: string }[] = [];
  const stem = file.name.replace(/\.[^.]+$/, "") || "page";
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const canvas = await renderPageToCanvas(page, 1.6);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (next) => (next ? resolve(next) : reject(new Error("JPEG failed"))),
        "image/jpeg",
        quality,
      );
    });
    blobs.push({ blob, name: `${stem}-${i}.jpg` });
  }
  return blobs;
}

async function canvasToJpeg(canvas: HTMLCanvasElement, quality: number) {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (next) => (next ? resolve(next) : reject(new Error("JPEG failed"))),
      "image/jpeg",
      quality,
    );
  });
  return new Uint8Array(await blob.arrayBuffer());
}

async function rasterToJpeg(file: File, quality: number) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0);
  return canvasToJpeg(canvas, quality);
}

export function rgbFromCss(r: number, g: number, b: number) {
  return rgb(r / 255, g / 255, b / 255);
}
