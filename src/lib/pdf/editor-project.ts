import type { PdfCanvasElement } from "./canvas-types";
import type { ExportMode } from "./editor-capabilities";
import type { PdfTextBox } from "./text-layer";
import { fromSceneDocument, toSceneDocument, validateSceneDocument, type ScenePageV2 } from "./scene-document";

export type EditorProject = { fileName: string; bytes: Uint8Array; elements: PdfCanvasElement[]; edits: Record<string, string>; boxesByPage: Record<number, PdfTextBox[]>; exportMode: ExportMode; pages: ScenePageV2[]; guidesByPage: Record<number, { x: number[]; y: number[] }> };

export function encodeProject(project: EditorProject) {
  let binary = "";
  for (let i = 0; i < project.bytes.length; i += 8192) binary += String.fromCharCode(...project.bytes.subarray(i, i + 8192));
  const { elements, pages, ...metadata } = project;
  return new Blob([JSON.stringify({ ...metadata, scene: toSceneDocument(elements, pages), bytes: btoa(binary), format: "cv-canvas", version: 2 })], { type: "application/json" });
}

export async function decodeProject(file: Blob): Promise<EditorProject> {
  if (file.size > 100 * 1024 * 1024) throw new Error("Project too large");
  const p = JSON.parse(await file.text());
  if (p?.format !== "cv-canvas" || ![1, 2].includes(p.version) || typeof p.fileName !== "string" || typeof p.bytes !== "string") throw new Error("Invalid project");
  if (p.version === 1 && (!Array.isArray(p.elements) || p.elements.length > 10000)) throw new Error("Invalid project");
  if (p.version === 2) validateSceneDocument(p.scene);
  const bytes = Uint8Array.from(atob(p.bytes), c => c.charCodeAt(0));
  if (new TextDecoder().decode(bytes.subarray(0, 5)) !== "%PDF-") throw new Error("Invalid PDF");
  const decodedElements: PdfCanvasElement[] = p.version === 2 ? fromSceneDocument(p.scene) : p.elements;
  if (decodedElements.length > 10000) throw new Error("Invalid project");
  for (const e of decodedElements) {
    if (!e || typeof e.id !== "string" || !["text", "shape", "image"].includes(e.type)) throw new Error("Invalid element");
    if (![e.x, e.y, e.width, e.height, e.rotation, e.opacity, e.pageIndex].every(Number.isFinite)) throw new Error("Invalid geometry");
    if (e.width <= 0 || e.height <= 0 || e.width > 10 || e.height > 10 || e.opacity < 0 || e.opacity > 1 || !Number.isInteger(e.pageIndex) || e.pageIndex < 0) throw new Error("Invalid bounds");
    if (e.sourceOp !== undefined && (!Number.isInteger(e.sourceOp) || e.sourceOp < 0)) throw new Error("Invalid source");
    if (e.type === "image" && (typeof e.dataUrl !== "string" || !/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(e.dataUrl) || typeof e.name !== "string")) throw new Error("Invalid image");
    if (e.type === "text" && (typeof e.text !== "string" || !Number.isFinite(e.fontSize) || e.fontSize < 4 || e.fontSize > 1000 || typeof e.fontFamily !== "string" || !["left", "center", "right"].includes(e.align))) throw new Error("Invalid text");
    if (e.type === "text" && e.fontDataUrl !== undefined && (typeof e.fontDataUrl !== "string" || !/^data:(font\/(ttf|otf|woff2?)|application\/(font-sfnt|octet-stream));base64,[A-Za-z0-9+/=]+$/i.test(e.fontDataUrl))) throw new Error("Invalid font");
    if (e.type === "shape" && (!["rectangle", "ellipse", "line"].includes(e.shape) || !Number.isFinite(e.strokeWidth))) throw new Error("Invalid shape");
    if (e.type === "text" && !/^#[0-9a-f]{6}$/i.test(e.color)) throw new Error("Invalid color");
    if (e.type === "shape" && (!/^#[0-9a-f]{6}$/i.test(e.fill) || !/^#[0-9a-f]{6}$/i.test(e.stroke))) throw new Error("Invalid color");
  }
  if (!p.edits || typeof p.edits !== "object" || Array.isArray(p.edits) || Object.values(p.edits).some(v => typeof v !== "string")) throw new Error("Invalid edits");
  if (!p.boxesByPage || typeof p.boxesByPage !== "object") throw new Error("Invalid text boxes");
  for (const boxes of Object.values(p.boxesByPage)) {
    if (!Array.isArray(boxes)) throw new Error("Invalid page");
    for (const b of boxes) {
      if (!b || typeof b.id !== "string" || typeof b.text !== "string") throw new Error("Invalid box");
      for (const key of ["pageIndex", "pdfX", "pdfY", "pdfW", "pdfH", "fontSize", "viewLeft", "viewTop", "viewWidth", "viewHeight"]) if (!Number.isFinite(b[key])) throw new Error("Invalid box geometry");
      for (const key of ["bg", "color"]) if (!Array.isArray(b[key]) || b[key].length !== 3 || b[key].some((v: unknown) => typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 255)) throw new Error("Invalid box color");
    }
  }
  const elements = decodedElements.map((element: PdfCanvasElement) => ({
    ...element,
    ...(element.type === "text" ? { lineHeight: element.lineHeight ?? 1.25, letterSpacing: element.letterSpacing ?? 0 } : {}),
    // V1 did not distinguish a read-only source selection from a real change.
    // Treat persisted V1 source objects as dirty so standard export fails closed.
    ...(p.version === 1 && (element.sourceOp !== undefined || element.sourceBoxId !== undefined) ? { sourcePristine: false } : {}),
  })) as PdfCanvasElement[];
  const exportMode: ExportMode = p.version === 2 && p.exportMode === "flattened" ? "flattened" : "standard";
  const guidesByPage = p.version === 2 && p.guidesByPage && typeof p.guidesByPage === "object" ? p.guidesByPage as Record<number, { x: number[]; y: number[] }> : {};
  for (const guide of Object.values(guidesByPage)) if (!guide || !Array.isArray(guide.x) || !Array.isArray(guide.y) || [...guide.x, ...guide.y].some(value => !Number.isFinite(value) || value < 0 || value > 1)) throw new Error("Invalid guides");
  const pages: ScenePageV2[] = p.version === 2 ? p.scene.pages : [];
  return { fileName: p.fileName, bytes, elements, edits: p.edits, boxesByPage: p.boxesByPage, exportMode, pages, guidesByPage };
}
