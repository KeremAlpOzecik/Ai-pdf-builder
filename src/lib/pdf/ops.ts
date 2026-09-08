import { degrees, PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
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

export type CompressQuality = "strong" | "balanced" | "keep";

const COMPRESS_QUALITY: Record<CompressQuality, number> = {
  strong: 0.42,
  balanced: 0.62,
  keep: 0.82,
};

export async function compressPdf(file: File, quality: CompressQuality | number = "balanced") {
  const jpegQuality = typeof quality === "number" ? quality : COMPRESS_QUALITY[quality];
  const data = await file.arrayBuffer();
  const doc = await openPdf(data);
  const out = await PDFDocument.create();
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const canvas = await renderPageToCanvas(page, 1.35);
    const jpeg = await canvasToJpeg(canvas, jpegQuality);
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

export type PdfPlacement = {
  /** Horizontal center, measured from the left edge (0-1). */
  x: number;
  /** Vertical center, measured from the top edge (0-1). */
  y: number;
};

function clampPlacement(value: number) {
  return Math.max(0, Math.min(1, value));
}

function pdfCenter(placement: PdfPlacement, width: number, height: number) {
  return {
    x: clampPlacement(placement.x) * width,
    y: (1 - clampPlacement(placement.y)) * height,
  };
}

export async function watermarkPdf(
  file: File,
  text: string,
  placement: PdfPlacement = { x: 0.5, y: 0.5 },
) {
  const label = text.trim() || "CONFIDENTIAL";
  const pdf = await PDFDocument.load(await file.arrayBuffer());
  const font = await embedUiFont(pdf);
  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();
    const size = Math.max(28, Math.min(width, height) * 0.09);
    const textWidth = font.widthOfTextAtSize(label, size);
    const angle = 32 * (Math.PI / 180);
    const center = pdfCenter(placement, width, height);
    page.drawText(label, {
      x: center.x - (textWidth * Math.cos(angle) - size * Math.sin(angle)) / 2,
      y: center.y - (textWidth * Math.sin(angle) + size * Math.cos(angle)) / 2,
      size,
      font,
      rotate: degrees(32),
      color: rgb(0.45, 0.45, 0.48),
      opacity: 0.22,
    });
  }
  return pdf.save();
}

export async function rotatePdf(file: File, angle: 90 | 180 | 270) {
  const pdf = await PDFDocument.load(await file.arrayBuffer());
  for (const page of pdf.getPages()) {
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + angle) % 360));
  }
  return pdf.save();
}

export async function numberPdfPages(
  file: File,
  placement: PdfPlacement = { x: 0.5, y: 0.965 },
) {
  const pdf = await PDFDocument.load(await file.arrayBuffer());
  const font = await embedUiFont(pdf);
  const total = pdf.getPageCount();
  pdf.getPages().forEach((page, index) => {
    const { width, height } = page.getSize();
    const label = `${index + 1} / ${total}`;
    const size = 10;
    const textWidth = font.widthOfTextAtSize(label, size);
    const center = pdfCenter(placement, width, height);
    page.drawText(label, {
      x: center.x - textWidth / 2,
      y: center.y - size * 0.35,
      size,
      font,
      color: rgb(0.25, 0.25, 0.28),
    });
  });
  return pdf.save();
}

export async function signPdf(
  file: File,
  signatureText: string,
  signatureImage?: File,
  placement: PdfPlacement = { x: 0.78, y: 0.88 },
) {
  const pdf = await PDFDocument.load(await file.arrayBuffer());
  const pages = pdf.getPages();
  const page = pages[pages.length - 1];
  const { width, height } = page.getSize();
  const center = pdfCenter(placement, width, height);
  let imageHeight = 0;
  let drawWidth = 0;
  if (signatureImage) {
    const bytes = new Uint8Array(await signatureImage.arrayBuffer());
    const png =
      signatureImage.type.includes("png") || signatureImage.name.toLowerCase().endsWith(".png");
    const image = png ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
    drawWidth = Math.min(180, width * 0.32);
    imageHeight = (image.height / image.width) * drawWidth;
    const groupHeight = imageHeight + (signatureText.trim() ? 24 : 0);
    page.drawImage(image, {
      x: center.x - drawWidth / 2,
      y: center.y - groupHeight / 2 + (signatureText.trim() ? 24 : 0),
      width: drawWidth,
      height: imageHeight,
    });
  }
  const name = signatureText.trim();
  if (name) {
    const font = await embedUiFont(pdf);
    const size = 16;
    const textWidth = font.widthOfTextAtSize(name, size);
    const nameCenterY = signatureImage ? center.y - (imageHeight + 24) / 2 + 8 : center.y;
    page.drawText(name, {
      x: center.x - textWidth / 2,
      y: nameCenterY - size * 0.35,
      size,
      font,
      color: rgb(0.12, 0.12, 0.16),
    });
  }
  return pdf.save();
}

export async function ocrPdf(file: File, onProgress?: (page: number, total: number) => void) {
  const data = await file.arrayBuffer();
  const doc = await openPdf(data);
  const out = await PDFDocument.create();
  const font = await embedUiFont(out);
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("tur+eng");
  try {
    const total = Math.min(doc.numPages, 20);
    for (let i = 1; i <= total; i += 1) {
      onProgress?.(i, total);
      const page = await doc.getPage(i);
      const canvas = await renderPageToCanvas(page, 1.7);
      const jpeg = await canvasToJpeg(canvas, 0.88);
      const image = await out.embedJpg(jpeg);
      const pdfPage = out.addPage([image.width, image.height]);
      pdfPage.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
      const result = await worker.recognize(canvas);
      drawInvisibleText(pdfPage, font, result.data.text);
    }
  } finally {
    await worker.terminate();
  }
  return out.save();
}

function drawInvisibleText(page: PDFPage, font: PDFFont, text: string) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return;
  const { width, height } = page.getSize();
  const size = 8;
  const maxWidth = width - 48;
  const words = cleaned.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  let y = height - 28;
  for (const line of lines.slice(0, 80)) {
    page.drawText(line, {
      x: 24,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
      opacity: 0,
    });
    y -= 10;
    if (y < 24) break;
  }
}
