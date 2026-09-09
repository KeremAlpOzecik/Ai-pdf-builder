import Konva from "konva";
import { PDFDocument } from "pdf-lib";
import { applyTextEdits } from "./apply-edits";
import type { PdfCanvasElement } from "./canvas-types";
import { ensureEditorFonts } from "./editor-fonts";
import { konvaFrame } from "./konva-geometry";
import { openPdf } from "./pdfjs-client";
import { renderWithSourceGraphics } from "./source-graphics";
import type { PdfTextBox } from "./text-layer";
import { layoutTextLines } from "./text-layout";

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image could not be decoded"));
    image.src = src;
  });
}

async function canvasPng(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("PNG encoding failed")), "image/png"));
  return new Uint8Array(await blob.arrayBuffer());
}

async function addElement(layer: Konva.Layer, element: PdfCanvasElement, width: number, height: number, scale: number) {
  const frame = konvaFrame(element, width, height);
  if (element.type === "text") {
    if (element.fontDataUrl && typeof FontFace !== "undefined") document.fonts.add(await new FontFace(element.fontFamily, `url(${element.fontDataUrl})`).load());
    const fontSize = element.fontSize * scale;
    const context = document.createElement("canvas").getContext("2d");
    if (context) context.font = `${element.italic ? "italic " : ""}${element.bold ? "700 " : "400 "}${fontSize}px '${element.fontFamily}'`;
    const measure = (value: string) => (context?.measureText(value).width ?? value.length * fontSize * 0.55) + Math.max(0, value.length - 1) * (element.letterSpacing ?? 0) * scale;
    const text = layoutTextLines(element.text, frame.width, frame.height, fontSize, element.lineHeight ?? 1.25, measure).map((line) => line.text).join("\n");
    layer.add(new Konva.Text({ ...frame, text, fontFamily: element.fontFamily, fontSize, fontStyle: `${element.bold ? "bold" : ""} ${element.italic ? "italic" : ""}`.trim() || "normal", fill: element.color, align: element.align, lineHeight: element.lineHeight ?? 1.25, letterSpacing: (element.letterSpacing ?? 0) * scale, wrap: "none" }));
    return;
  }
  if (element.type === "image") {
    const image = await loadImage(element.dataUrl);
    const crop = element.crop ? { cropX: element.crop.x * image.naturalWidth, cropY: element.crop.y * image.naturalHeight, cropWidth: element.crop.width * image.naturalWidth, cropHeight: element.crop.height * image.naturalHeight } : {};
    const node = new Konva.Image({ ...frame, ...crop, image });
    if (element.filters) {
      node.cache();
      node.filters([Konva.Filters.Brighten, Konva.Filters.Contrast, Konva.Filters.HSL]);
      node.brightness(element.filters.brightness);
      node.contrast(element.filters.contrast);
      node.saturation(element.filters.saturation);
    }
    layer.add(node);
    return;
  }
  if (element.shape === "ellipse") layer.add(new Konva.Ellipse({ ...frame, offsetX: 0, offsetY: 0, radiusX: frame.width / 2, radiusY: frame.height / 2, fill: element.fill, stroke: element.stroke, strokeWidth: element.strokeWidth * scale, dash: element.dash?.map(value => value * scale) }));
  else if (element.shape === "line") layer.add(new Konva.Line({ ...frame, points: [0, frame.height / 2, frame.width, frame.height / 2], stroke: element.stroke, strokeWidth: element.strokeWidth * scale, dash: element.dash?.map(value => value * scale) }));
  else layer.add(new Konva.Rect({ ...frame, fill: element.fill, stroke: element.stroke, strokeWidth: element.strokeWidth * scale, cornerRadius: (element.cornerRadius ?? 0) * scale, dash: element.dash?.map(value => value * scale) }));
}

/** Renders the PDF background and editor objects through one Konva scene at 300 DPI. */
export async function exportFlattenedScenePdf(original: Uint8Array, boxes: PdfTextBox[], edits: Record<string, string>, elements: PdfCanvasElement[], dpi = 300) {
  const scale = dpi / 72;
  const edited = await applyTextEdits(original, boxes, edits);
  const sourceElements = elements.filter((element) => element.sourceOp !== undefined);
  const overlays = elements.filter((element) => element.sourceOp === undefined && !element.hidden && element.sourcePristine !== true);
  const source = await openPdf(edited);
  const output = await PDFDocument.create();
  try {
    await ensureEditorFonts();
    await Promise.all([
      document.fonts.load("400 16px 'Noto Sans'"),
      document.fonts.load("italic 400 16px 'Noto Sans'"),
      document.fonts.load("700 16px 'Noto Sans'"),
      document.fonts.load("italic 700 16px 'Noto Sans'"),
    ]);
    for (let pageIndex = 0; pageIndex < source.numPages; pageIndex += 1) {
      const page = await source.getPage(pageIndex + 1);
      const pageSourceElements = sourceElements.filter((element) => element.pageIndex === pageIndex);
      const { canvas: background, viewport } = await renderWithSourceGraphics(page, scale, pageSourceElements, false);
      const container = document.createElement("div");
      const stage = new Konva.Stage({ container, width: viewport.width, height: viewport.height });
      const layer = new Konva.Layer();
      stage.add(layer);
      layer.add(new Konva.Image({ image: background, x: 0, y: 0, width: viewport.width, height: viewport.height, listening: false }));
      for (const element of overlays.filter((candidate) => candidate.pageIndex === pageIndex)) await addElement(layer, element, viewport.width, viewport.height, scale);
      layer.draw();
      const png = await output.embedPng(await canvasPng(stage.toCanvas({ pixelRatio: 1 })));
      const pdfPage = output.addPage([viewport.width / scale, viewport.height / scale]);
      pdfPage.drawImage(png, { x: 0, y: 0, width: pdfPage.getWidth(), height: pdfPage.getHeight() });
      stage.destroy();
    }
  } finally {
    await source.loadingTask.destroy().catch(() => undefined);
  }
  return output.save();
}
