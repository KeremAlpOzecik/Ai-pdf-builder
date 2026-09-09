import type { PDFPageProxy } from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";
import { loadPdfjs, openPdf } from "./pdfjs-client";
import type { PdfCanvasElement } from "./canvas-types";

export type SourceGraphic = { operation: number; name: string };

async function drawingOperations(page: PDFPageProxy) {
  const { OPS } = await loadPdfjs();
  const list = await page.getOperatorList();
  const graphicCodes = new Set([OPS.paintImageXObject, OPS.paintInlineImageXObject,
    OPS.paintImageMaskXObject, OPS.paintImageXObjectRepeat, OPS.paintSolidColorImageMask,
    OPS.shadingFill]);
  const textCodes = new Set([OPS.showText, OPS.showSpacedText, OPS.nextLineShowText, OPS.nextLineSetSpacingShowText]);
  const graphics: SourceGraphic[] = [];
  const draws = new Set<number>();
  list.fnArray.forEach((code, index) => {
    const path = code === OPS.constructPath && list.argsArray[index]?.[0] !== OPS.endPath;
    if (path || graphicCodes.has(code)) {
      graphics.push({ operation: index, name: path ? "Vektör / Vector" : "Görsel / Image" });
      draws.add(index);
    }
    if (textCodes.has(code)) draws.add(index);
  });
  return { graphics, draws };
}

export async function listSourceGraphics(page: PDFPageProxy) {
  return (await drawingOperations(page)).graphics;
}

export async function extractSourceGraphic(page: PDFPageProxy, operation: number): Promise<PdfCanvasElement> {
  const { draws } = await drawingOperations(page);
  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  await page.render({ canvas, canvasContext: context, viewport, background: "rgba(0,0,0,0)",
    operationsFilter: index => !draws.has(index) || index === operation }).promise;
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  let left = canvas.width, top = canvas.height, right = -1, bottom = -1;
  for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
    if (pixels[(y * canvas.width + x) * 4 + 3] > 0) {
      left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
  }
  if (right < left) throw new Error("This operation has no independently visible graphic.");
  const width = right - left + 1, height = bottom - top + 1;
  const crop = document.createElement("canvas"); crop.width = width; crop.height = height;
  crop.getContext("2d")!.drawImage(canvas, left, top, width, height, 0, 0, width, height);
  const base = { id: crypto.randomUUID(), sourceOp: operation, pageIndex: page.pageNumber - 1,
    x: left / viewport.width, y: top / viewport.height, width: width / viewport.width,
    height: height / viewport.height, rotation: 0, opacity: 1 };
  // A uniformly filled rectangle remains a recolorable shape; complex artwork retains its alpha mask.
  const center = ((top + Math.floor(height / 2)) * canvas.width + left + Math.floor(width / 2)) * 4;
  const color = Array.from(pixels.slice(center, center + 3));
  let uniform = pixels[center + 3] === 255;
  for (let y = top + 1; uniform && y < bottom; y++) for (let x = left + 1; x < right; x++) {
    const i = (y * canvas.width + x) * 4;
    if (pixels[i + 3] !== 255 || color.some((c, j) => Math.abs(pixels[i + j] - c) > 2)) { uniform = false; break; }
  }
  if (uniform && width > 2 && height > 2) return { ...base, type: "shape", shape: "rectangle",
    fill: "#" + color.map(c => c.toString(16).padStart(2, "0")).join(""), stroke: "#000000", strokeWidth: 0 };
  return { ...base, type: "image", name: `PDF ${operation}`, dataUrl: crop.toDataURL("image/png") };
}

export async function renderWithSourceGraphics(page: PDFPageProxy, scale: number, elements: PdfCanvasElement[], drawReplacements = true) {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
  canvas.style.width = `${viewport.width}px`; canvas.style.height = `${viewport.height}px`;
  const ctx = canvas.getContext("2d")!;
  const sources = new Map(elements.filter(e => e.sourceOp !== undefined && e.sourcePristine !== true && e.pageIndex === page.pageNumber - 1).map(e => [e.sourceOp!, e]));
  const images = new Map<string, HTMLImageElement>();
  await Promise.all([...sources.values()].filter(e => e.type === "image" && !e.hidden).map(async e => {
    if (e.type !== "image") return;
    const image = new Image(); image.src = e.dataUrl; await image.decode(); images.set(e.id, image);
  }));
  await page.render({ canvas, canvasContext: ctx, viewport, operationsFilter: index => {
    const e = sources.get(index);
    if (!e) return true;
    if (e.hidden || !drawReplacements) return false;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    const w = e.width * viewport.width, h = e.height * viewport.height;
    ctx.translate(e.x * viewport.width + w / 2, e.y * viewport.height + h / 2);
    ctx.rotate(e.rotation * Math.PI / 180); ctx.globalAlpha = e.opacity;
    if (e.type === "image") ctx.drawImage(images.get(e.id)!, -w / 2, -h / 2, w, h);
    if (e.type === "shape") {
      ctx.fillStyle = e.fill; ctx.strokeStyle = e.stroke; ctx.lineWidth = e.strokeWidth * scale;
      ctx.beginPath();
      if (e.shape === "ellipse") ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
      else if (e.shape === "line") { ctx.moveTo(-w / 2, 0); ctx.lineTo(w / 2, 0); }
      else ctx.rect(-w / 2, -h / 2, w, h);
      if (e.shape !== "line") ctx.fill();
      if (e.strokeWidth) ctx.stroke();
    }
    ctx.restore(); return false;
  } }).promise;
  return { canvas, viewport };
}

export async function bakeSourceGraphics(original: Uint8Array, elements: PdfCanvasElement[]) {
  const affected = new Set(elements.filter(e => e.sourceOp !== undefined).map(e => e.pageIndex));
  if (!affected.size) return original;
  const doc = await openPdf(original);
  try {
    const source = await PDFDocument.load(original), result = await PDFDocument.create();
    for (let i = 0; i < doc.numPages; i++) {
      if (!affected.has(i)) { result.addPage((await result.copyPages(source, [i]))[0]); continue; }
      const page = await doc.getPage(i + 1);
      const { canvas, viewport } = await renderWithSourceGraphics(page, 2, elements);
      const png = await result.embedPng(canvas.toDataURL("image/png"));
      result.addPage([viewport.width / 2, viewport.height / 2]).drawImage(png, { x: 0, y: 0, width: viewport.width / 2, height: viewport.height / 2 });
    }
    return result.save();
  } finally { await doc.loadingTask.destroy(); }
}
