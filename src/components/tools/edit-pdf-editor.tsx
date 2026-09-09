"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  Copy,
  FileDown,
  FileUp,
  ImagePlus,
  Italic,
  Layers3,
  Minus,
  Redo2,
  RotateCcw,
  Square,
  Trash2,
  Type,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";
import { formatBytes } from "@/components/tools/file-list";
import { FileDrop } from "@/components/tools/file-drop";
import { Button } from "@/components/ui/button";
import { MAX_FILE_BYTES } from "@/lib/tools";
import { downloadBlob, stem } from "@/lib/download";
import { exportCanvasPdf } from "@/lib/pdf/canvas-export";
import type { CanvasShapeElement, CanvasTextElement, PdfCanvasElement } from "@/lib/pdf/canvas-types";
import { analyzeEditorCapabilities, inspectPdfSecurity, isPersistedElement, type ExportMode } from "@/lib/pdf/editor-capabilities";
import { exportFlattenedScenePdf } from "@/lib/pdf/konva-flatten-export";
import { loadPdfjs, openPdf, renderPage } from "@/lib/pdf/pdfjs-client";
import { extractTextBoxes, type PdfTextBox } from "@/lib/pdf/text-layer";
import { layoutTextLines } from "@/lib/pdf/text-layout";
import { listSourceGraphics, extractSourceGraphic, renderWithSourceGraphics, type SourceGraphic } from "@/lib/pdf/source-graphics";
import { useDisplayLanguage, useLabels } from "@/components/providers";

type ActiveEdit = {
  id: string;
  text: string;
  original: string;
  left: number;
  top: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  color: [number, number, number];
  bg: [number, number, number];
};

type EditorSnapshot = {
  edits: Record<string, string>;
  elements: PdfCanvasElement[];
  bytes: Uint8Array | null;
  pageCount: number;
  page: number;
  boxesByPage: Record<number, PdfTextBox[]>;
  documentRevision: number;
  guidesByPage: Record<number, { x: number[]; y: number[] }>;
};

const PdfSceneStage = dynamic(() => import("@/components/tools/pdf-scene-stage"), { ssr: false });

function id() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Image could not be read"));
    reader.readAsDataURL(file);
  });
}

export function EditPdfEditor() {
  const labels = useLabels();
  const tr = useDisplayLanguage() === "TR";
  const viewerRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);
  const clipboardRef = useRef<PdfCanvasElement[]>([]);
  const sourceBytesRef = useRef<Uint8Array | null>(null);
  const [error, setError] = useState("");
  const [renderVersion, setRenderVersion] = useState(0);
  const [saved, setSaved] = useState<{ blob: Blob; name: string } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [originalBytes, setOriginalBytes] = useState<Uint8Array | null>(null);
  const [pageCount, setPageCount] = useState(1);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.25);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [boxes, setBoxes] = useState<PdfTextBox[]>([]);
  const [boxesByPage, setBoxesByPage] = useState<Record<number, PdfTextBox[]>>({});
  const [active, setActive] = useState<ActiveEdit | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [elements, setElements] = useState<PdfCanvasElement[]>([]);
  const [selectedId, setPrimarySelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [exportMode, setExportMode] = useState<ExportMode>("standard");
  const [undoStack, setUndoStack] = useState<EditorSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<EditorSnapshot[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [sourceGraphics, setSourceGraphics] = useState<SourceGraphic[]>([]);
  const [documentRevision, setDocumentRevision] = useState(0);
  const [guidesByPage, setGuidesByPage] = useState<Record<number, { x: number[]; y: number[] }>>({});
  const sourceSignature = JSON.stringify(elements.filter(e => e.sourceOp !== undefined && e.sourcePristine !== true));
  const thumbnailSceneSignature = JSON.stringify(elements.filter((element) => element.pageIndex === page - 1 && isPersistedElement(element)));
  const thumbnailEditSignature = JSON.stringify(edits);

  function setSelectedId(next: string | null) {
    setPrimarySelectedId(next);
    setSelectedIds(next ? [next] : []);
  }

  const selected = elements.find((element) => element.id === selectedId) ?? null;
  const pageElements = elements.filter((element) => element.pageIndex === page - 1);
  const persistedElements = elements.filter(isPersistedElement);
  const changeCount = documentRevision + persistedElements.length + Object.keys(edits).filter((boxId) => !persistedElements.some((element) => element.sourceBoxId === boxId)).length;
  const security = useMemo(() => originalBytes ? inspectPdfSecurity(originalBytes) : { encrypted: false, signed: false }, [originalBytes]);
  const capabilities = analyzeEditorCapabilities(edits, elements, security);

  function textLayoutMetrics(element: CanvasTextElement, fontSize = element.fontSize) {
    const pixelSize = Math.max(1, fontSize * scale);
    const context = document.createElement("canvas").getContext("2d");
    if (context) context.font = `${element.italic ? "italic " : ""}${element.bold ? "700 " : "400 "}${pixelSize}px '${element.fontFamily}'`;
    const measure = (value: string) => (context?.measureText(value).width ?? value.length * pixelSize * 0.55) + Math.max(0, value.length - 1) * (element.letterSpacing ?? 0) * scale;
    const lines = layoutTextLines(element.text, Math.max(1, element.width * size.width), Number.MAX_SAFE_INTEGER, pixelSize, element.lineHeight ?? 1.25, measure);
    return { lines, requiredHeight: lines.length * pixelSize * (element.lineHeight ?? 1.25), availableHeight: element.height * size.height };
  }

  function adjustTextLayout(element: CanvasTextElement, patch: Partial<PdfCanvasElement>) {
    let next = { ...element, ...patch } as CanvasTextElement;
    if (next.autoFit) {
      const maximum = "fontSize" in patch && typeof patch.fontSize === "number" ? patch.fontSize : next.autoFitMaxSize ?? next.fontSize;
      let fitted = Math.max(6, maximum);
      while (fitted > 6 && textLayoutMetrics(next, fitted).requiredHeight > next.height * size.height) fitted -= 0.5;
      next = { ...next, fontSize: fitted, autoFitMaxSize: maximum };
    }
    if (next.autoHeight) {
      const needed = textLayoutMetrics(next).requiredHeight / Math.max(1, size.height);
      next = { ...next, height: next.allowOverflow ? Math.max(0.02, needed) : clamp(needed, 0.02, 1 - next.y) };
    }
    return next;
  }

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !originalBytes) return;
    let cancelled = false;
    const fit = async () => {
      const doc = await openPdf(originalBytes);
      try {
        const pdfPage = await doc.getPage(page);
        const base = pdfPage.getViewport({ scale: 1 });
        const padding = window.innerWidth >= 640 ? 64 : 32;
        if (!cancelled) setScale(Math.max(0.2, Math.min(1.25, (viewer.clientWidth - padding) / base.width)));
      } finally { await doc.loadingTask.destroy(); }
    };
    const observer = new ResizeObserver(() => { void fit().catch(() => undefined); });
    observer.observe(viewer);
    return () => { cancelled = true; observer.disconnect(); };
  }, [originalBytes, page]);

  useEffect(() => {
    if (!originalBytes || !layerRef.current || !canvasHostRef.current) return;
    let cancelled = false;
    const container = layerRef.current;
    const canvasHost = canvasHostRef.current;
    let doc: Awaited<ReturnType<typeof openPdf>> | null = null;

    void (async () => {
      try {
        const pdfjs = await loadPdfjs();
        doc = await openPdf(originalBytes);
        const pdfPage = await doc.getPage(page);
        // Keep the preview background sourced from the same 300 DPI render used by
        // flattened export, then scale it with CSS. This avoids a second, lower
        // quality PDF.js rasterization path while text hit boxes stay in view units.
        const viewport = pdfPage.getViewport({ scale });
        const { canvas } = await renderWithSourceGraphics(pdfPage, 300 / 72, JSON.parse(sourceSignature), false);
        if (cancelled) return;
        const nextBoxes = await extractTextBoxes(pdfPage, canvas, viewport);
        const content = await pdfPage.getTextContent();
        if (cancelled) return;
        canvas.className = "pointer-events-none block select-none";
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        canvasHost.replaceChildren(canvas);
        container.replaceChildren();
        const layer = new pdfjs.TextLayer({ textContentSource: content, container, viewport });
        await layer.render();
        if (cancelled) return layer.cancel();
        container.style.width = "100%";
        container.style.height = "100%";
        let boxCursor = 0;
        layer.textDivs.forEach((node) => {
          // PDF.js can omit empty text items; array indexes are not interchangeable.
          const match = nextBoxes.findIndex((box, index) => index >= boxCursor && box.text === node.textContent);
          const box = match < 0 ? undefined : nextBoxes[match];
          if (match >= 0) boxCursor = match + 1;
          if (box?.text.trim() && node instanceof HTMLElement) {
            node.dataset.boxId = box.id;
            node.tabIndex = 0;
            node.setAttribute("role", "button");
            node.setAttribute("aria-label", box.text);
          }
        });
        setError("");
        setPageCount(doc.numPages);
        setSize({ width: viewport.width, height: viewport.height });
        setBoxes(nextBoxes);
        setBoxesByPage((current) => ({ ...current, [page]: nextBoxes }));
        setEmpty(nextBoxes.every((box) => !box.text.trim()));
        setSourceGraphics(await listSourceGraphics(pdfPage));
      } catch (error) {
        if (!cancelled) { console.error("PDF editor failed", error); setError(tr ? "PDF işlenemedi. Dosya bozuk veya parola korumalı olabilir. Yeniden deneyin." : "The PDF could not be processed. It may be damaged or password protected. Please retry."); }
      } finally {
        if (doc) await doc.loadingTask.destroy().catch(() => undefined);
        if (!cancelled) setLoadingPage(false);
      }
    })();

    return () => {
      cancelled = true;
      container.replaceChildren();
      canvasHost.replaceChildren();
    };
  }, [originalBytes, page, scale, labels.toolFailed, tr, renderVersion, sourceSignature]);

  useEffect(() => {
    if (!originalBytes) return;
    let cancelled = false;
    let doc: Awaited<ReturnType<typeof openPdf>> | null = null;
    void (async () => {
      doc = await openPdf(originalBytes);
      for (let number = 1; number <= doc.numPages; number += 1) {
        const pdfPage = await doc.getPage(number);
        const { canvas } = await renderPage(pdfPage, 0.16);
        if (cancelled) return;
        const url = canvas.toDataURL("image/jpeg", 0.72);
        setThumbnails((current) => ({ ...current, [number]: url }));
      }
    })().catch(() => undefined).finally(() => doc?.loadingTask.destroy().catch(() => undefined));
    return () => { cancelled = true; };
  }, [originalBytes]);

  useEffect(() => {
    if (active) inputRef.current?.focus();
  }, [active]);

  useEffect(() => {
    if (!originalBytes || !pageRef.current || !size.width || !size.height) return;
    const timer = window.setTimeout(() => {
      const root = pageRef.current;
      const background = canvasHostRef.current?.querySelector("canvas");
      const scene = root?.querySelector<HTMLCanvasElement>(".konvajs-content canvas");
      if (!root || !background) return;
      const width = 112;
      const height = Math.max(1, Math.round(width * size.height / size.width));
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.fillStyle = "white"; context.fillRect(0, 0, width, height);
      context.drawImage(background, 0, 0, width, height);
      const sx = width / size.width;
      const sy = height / size.height;
      for (const mask of root.querySelectorAll<HTMLElement>(".pdf-edited-text")) {
        context.fillStyle = getComputedStyle(mask).backgroundColor;
        context.fillRect(mask.offsetLeft * sx, mask.offsetTop * sy, mask.offsetWidth * sx, mask.offsetHeight * sy);
      }
      if (scene) context.drawImage(scene, 0, 0, width, height);
      setThumbnails((current) => ({ ...current, [page]: canvas.toDataURL("image/jpeg", 0.76) }));
    }, 180);
    return () => window.clearTimeout(timer);
  }, [originalBytes, page, size.width, size.height, thumbnailSceneSignature, thumbnailEditSignature]);

  function snapshot(): EditorSnapshot {
    return { edits, elements, bytes: originalBytes, pageCount, page, boxesByPage, documentRevision, guidesByPage };
  }

  function restoreSnapshot(value: EditorSnapshot) {
    setElements(value.elements); setEdits(value.edits); setOriginalBytes(value.bytes); setPageCount(value.pageCount); setPage(value.page); setBoxesByPage(value.boxesByPage); setDocumentRevision(value.documentRevision); setGuidesByPage(value.guidesByPage);
    setActive(null); setSelectedId(null); setThumbnails({}); setLoadingPage(true);
  }

  function applyChange(nextElements: PdfCanvasElement[], nextEdits = edits) {
    setUndoStack((stack) => [...stack.slice(-49), snapshot()]);
    setRedoStack([]);
    setElements(nextElements);
    setEdits(nextEdits);
  }

  async function onFiles(files: File[]) {
    const next = files[0];
    if (!next) return;
    setError(""); setSaved(null);
    setFile(next);
    setPage(1);
    setActive(null);
    setEdits({});
    setElements([]);
    setSelectedId(null);
    setUndoStack([]);
    setRedoStack([]);
    setBoxesByPage({});
    setDocumentRevision(0);
    setGuidesByPage({});
    setThumbnails({});
    setLoadingPage(true);
    const bytes = new Uint8Array(await next.arrayBuffer());
    sourceBytesRef.current = bytes;
    setOriginalBytes(bytes);
  }

  function startEdit(box: PdfTextBox) {
    const existing = elements.find(element => element.type === "text" && element.sourceBoxId === box.id);
    if (existing) { setSelectedId(existing.id); return; }
    const element: CanvasTextElement = {
      id: id(), sourceBoxId: box.id, type: "text", pageIndex: box.pageIndex,
      text: edits[box.id] ?? box.text,
      x: box.viewLeft / size.width, y: box.viewTop / size.height,
      width: Math.min(1 - box.viewLeft / size.width, Math.max(box.viewWidth + 12 * scale, 30 * scale) / size.width),
      height: Math.max(box.viewHeight * 1.6, box.fontSize * scale * 1.6) / size.height,
      fontSize: box.fontSize, fontFamily: "Noto Sans",
      color: "#" + box.color.map(value => Math.round(value).toString(16).padStart(2, "0")).join(""),
      align: "left", bold: false, italic: false, rotation: 0, opacity: 1,
      sourcePristine: true,
    };
    // Selection is not an edit. The source becomes dirty only after a property changes.
    setElements([...elements, element]);
    setActive(null);
    setSelectedId(element.id);
  }

  function commitTextEdit() {
    if (!active) return edits;
    const previous = edits[active.id] ?? active.original;
    if (active.text === previous) {
      setActive(null);
      return edits;
    }
    const next = { ...edits };
    if (active.text === active.original) delete next[active.id];
    else next[active.id] = active.text;
    setUndoStack((stack) => [...stack.slice(-49), snapshot()]);
    setRedoStack([]);
    setEdits(next);
    setActive(null);
    return next;
  }

  function undo() {
    const previous = undoStack.at(-1);
    if (!previous) return;
    setRedoStack((stack) => [...stack, snapshot()]);
    setUndoStack((stack) => stack.slice(0, -1));
    restoreSnapshot(previous);
  }

  function redo() {
    const next = redoStack.at(-1);
    if (!next) return;
    setUndoStack((stack) => [...stack, snapshot()]);
    setRedoStack((stack) => stack.slice(0, -1));
    restoreSnapshot(next);
  }

  function addText() {
    const element: CanvasTextElement = {
      id: id(), type: "text", pageIndex: page - 1, x: 0.3, y: 0.42, width: 0.4, height: 0.08,
      rotation: 0, opacity: 1, text: labels.newText, fontSize: 18, fontFamily: "Noto Sans", color: "#1c1917", align: "left", bold: false, italic: false,
    };
    applyChange([...elements, element]);
    setSelectedId(element.id);
  }

  function addShape(shape: CanvasShapeElement["shape"]) {
    const element: CanvasShapeElement = {
      id: id(), type: "shape", shape, pageIndex: page - 1, x: 0.34, y: 0.4,
      width: shape === "line" ? 0.32 : 0.24, height: shape === "line" ? 0.015 : 0.14,
      rotation: 0, opacity: 1, fill: shape === "line" ? "#2563eb" : "#dbeafe", stroke: "#2563eb", strokeWidth: 2,
    };
    applyChange([...elements, element]);
    setSelectedId(element.id);
  }

  async function addImage(file: File) {
    if (file.size > MAX_FILE_BYTES || !["image/png", "image/jpeg"].includes(file.type)) {
      toast.error(tr ? "En fazla 25 MB boyutunda bir PNG veya JPG seçin." : "Choose a PNG or JPG up to 25 MB.");
      return;
    }
    try {
    const dataUrl = await readAsDataUrl(file);
    const bitmap = await createImageBitmap(file);
    const width = 0.32;
    const height = clamp(width * (size.width || 1) / (bitmap.width / bitmap.height) / (size.height || 1), 0.08, 0.5);
    bitmap.close();
    const element: PdfCanvasElement = { id: id(), type: "image", pageIndex: page - 1, x: 0.34, y: 0.32, width, height, rotation: 0, opacity: 1, dataUrl, name: file.name };
    applyChange([...elements, element]);
    setSelectedId(element.id);
    } catch (error) {
      console.error("Editor image import failed", error);
      toast.error(tr ? "Görsel okunamadı. Başka bir PNG veya JPG seçin." : "The image could not be read. Choose another PNG or JPG.");
    }
  }

  async function replaceImage(file: File) {
    if (selected?.type !== "image") return;
    if (file.size > MAX_FILE_BYTES || !["image/png", "image/jpeg"].includes(file.type)) {
      toast.error(tr ? "PNG veya JPG seçin (en fazla 25 MB)." : "Choose PNG or JPG (up to 25 MB).");
      return;
    }
    try { patchSelected({ dataUrl: await readAsDataUrl(file), name: file.name } as Partial<PdfCanvasElement>); }
    catch { toast.error(labels.toolFailed); }
  }

  async function uploadFont(file: File) {
    if (selected?.type !== "text") return;
    const supported = /\.(ttf|otf|woff2?)$/i.test(file.name) || ["font/ttf", "font/otf", "font/woff", "font/woff2", "application/font-sfnt"].includes(file.type);
    if (!supported || file.size > 10 * 1024 * 1024) {
      toast.error(tr ? "En fazla 10 MB boyutunda TTF, OTF, WOFF veya WOFF2 seçin." : "Choose a TTF, OTF, WOFF or WOFF2 file up to 10 MB.");
      return;
    }
    try {
      const fontDataUrl = await readAsDataUrl(file);
      const family = `UserFont-${id()}`;
      if (typeof FontFace !== "undefined") document.fonts.add(await new FontFace(family, `url(${fontDataUrl})`).load());
      patchSelected({ fontFamily: family, fontDataUrl } as Partial<CanvasTextElement>);
    } catch (error) {
      console.error("Editor font import failed", error);
      toast.error(tr ? "Font okunamadı veya tarayıcı tarafından desteklenmiyor." : "The font could not be read or is not supported by this browser.");
    }
  }

  function patchElement(elementId: string, patch: Partial<PdfCanvasElement>) {
    const target = elements.find((element) => element.id === elementId);
    if (!target) return;
    if (target.locked && patch.locked !== false && patch.hidden === undefined) return;
    const sourceMutation = target.sourcePristine === true;
    const nextEdits = sourceMutation && target.sourceBoxId ? { ...edits, [target.sourceBoxId]: "" } : edits;
    applyChange(elements.map((element) => {
      if (element.id !== elementId) return element;
      const merged = element.type === "text" ? adjustTextLayout(element, patch) : { ...element, ...patch } as PdfCanvasElement;
      return { ...merged, ...(sourceMutation ? { sourcePristine: false } : {}) } as PdfCanvasElement;
    }), nextEdits);
  }

  function patchElements(patches: Array<{ id: string; patch: Partial<PdfCanvasElement> }>) {
    if (!patches.length) return;
    const byId = new Map(patches.map((entry) => [entry.id, entry.patch]));
    let nextEdits = edits;
    const next = elements.map((element) => {
      const patch = byId.get(element.id);
      if (!patch || element.locked) return element;
      if (element.sourcePristine === true && element.sourceBoxId) nextEdits = { ...nextEdits, [element.sourceBoxId]: "" };
      return { ...element, ...patch, ...(element.sourcePristine === true ? { sourcePristine: false } : {}) } as PdfCanvasElement;
    });
    applyChange(next, nextEdits);
  }

  function patchSelected(patch: Partial<PdfCanvasElement>) {
    if (selected) patchElement(selected.id, patch);
  }

  function removeSelected() {
    if (!selected || selected.locked) return;
    if (selected.sourceOp !== undefined || selected.sourceBoxId !== undefined) {
      patchElement(selected.id, { hidden: true });
    } else {
      applyChange(elements.filter((element) => element.id !== selected.id));
    }
    setSelectedId(null);
  }

  function duplicateSelected() {
    if (!selected) return;
    const copy = { ...selected, sourceOp: undefined, sourceBoxId: undefined, sourcePristine: false, locked: false, id: id(), x: clamp(selected.x + 0.025, 0, 1 - selected.width), y: clamp(selected.y + 0.025, 0, 1 - selected.height) };
    applyChange([...elements, copy]);
    setSelectedId(copy.id);
  }

  function moveLayer(direction: -1 | 1) {
    if (!selected) return;
    const index = elements.findIndex((element) => element.id === selected.id);
    let target = index + direction;
    while (target >= 0 && target < elements.length && elements[target].pageIndex !== selected.pageIndex) target += direction;
    if (target < 0 || target >= elements.length) return;
    const next = [...elements];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    applyChange(next);
  }

  function goToPage(nextPage: number) {
    commitTextEdit();
    setSelectedId(null);
    setBoxes([]);
    setLoadingPage(true);
    setPage(clamp(nextPage, 1, pageCount));
  }

  function reorderLayer(draggedId: string, targetId: string) {
    if (draggedId === targetId) return;
    const dragged = elements.find((element) => element.id === draggedId);
    const target = elements.find((element) => element.id === targetId);
    if (!dragged || !target || dragged.pageIndex !== target.pageIndex) return;
    const next = [...elements];
    const from = next.findIndex((element) => element.id === draggedId);
    const to = next.findIndex((element) => element.id === targetId);
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    applyChange(next);
  }

  async function mutatePages(action: "add" | "duplicate" | "delete" | "up" | "down") {
    if (!originalBytes) return;
    const currentIndex = page - 1;
    const targetIndex = action === "up" ? currentIndex - 1 : action === "down" ? currentIndex + 1 : currentIndex;
    if ((action === "delete" && pageCount <= 1) || ((action === "up" || action === "down") && (targetIndex < 0 || targetIndex >= pageCount))) return;
    setBusy(true);
    try {
      const before = snapshot();
      const pdf = await PDFDocument.load(originalBytes);
      const current = pdf.getPage(currentIndex);
      const pageSize = current.getSize();
      let nextPage = page;
      if (action === "add") {
        pdf.insertPage(currentIndex + 1, [pageSize.width, pageSize.height]);
        nextPage = page + 1;
      } else if (action === "duplicate") {
        const [copy] = await pdf.copyPages(pdf, [currentIndex]);
        pdf.insertPage(currentIndex + 1, copy);
        nextPage = page + 1;
      } else if (action === "delete") {
        pdf.removePage(currentIndex);
        nextPage = Math.min(page, pageCount - 1);
      } else {
        pdf.removePage(currentIndex);
        pdf.insertPage(targetIndex, current);
        nextPage = targetIndex + 1;
      }
      const mapPage = (oldIndex: number): number | null => {
        if (action === "delete") return oldIndex === currentIndex ? null : oldIndex > currentIndex ? oldIndex - 1 : oldIndex;
        if (action === "add" || action === "duplicate") return oldIndex > currentIndex ? oldIndex + 1 : oldIndex;
        if (oldIndex === currentIndex) return targetIndex;
        if (oldIndex === targetIndex) return currentIndex;
        return oldIndex;
      };
      const remapBox = (box: PdfTextBox, nextIndex: number) => ({ ...box, pageIndex: nextIndex, id: `${nextIndex}-${box.id.replace(/^\d+-/, "")}` });
      const baseBoxIds = new Map<string, string>();
      const duplicateBoxIds = new Map<string, string>();
      const nextBoxesByPage: Record<number, PdfTextBox[]> = {};
      for (const pageBoxes of Object.values(boxesByPage)) for (const box of pageBoxes) {
        const mapped = mapPage(box.pageIndex);
        if (mapped !== null) {
          const nextBox = remapBox(box, mapped);
          (nextBoxesByPage[mapped + 1] ??= []).push(nextBox);
          baseBoxIds.set(box.id, nextBox.id);
        }
        if (action === "duplicate" && box.pageIndex === currentIndex) {
          const nextBox = remapBox(box, currentIndex + 1);
          (nextBoxesByPage[currentIndex + 2] ??= []).push(nextBox);
          duplicateBoxIds.set(box.id, nextBox.id);
        }
      }
      const nextEdits: Record<string, string> = {};
      for (const [boxId, value] of Object.entries(edits)) {
        const baseId = baseBoxIds.get(boxId);
        if (baseId) nextEdits[baseId] = value;
        const duplicateId = duplicateBoxIds.get(boxId);
        if (duplicateId) nextEdits[duplicateId] = value;
      }
      const cloneGroups = new Map<string, string>();
      const nextElements = elements.flatMap((element) => {
        const mapped = mapPage(element.pageIndex);
        const base = mapped === null ? [] : [{ ...element, pageIndex: mapped, sourceBoxId: element.sourceBoxId ? baseBoxIds.get(element.sourceBoxId) ?? element.sourceBoxId : undefined } as PdfCanvasElement];
        if (action !== "duplicate" || element.pageIndex !== currentIndex) return base;
        if (element.groupId && !cloneGroups.has(element.groupId)) cloneGroups.set(element.groupId, id());
        return [...base, { ...element, id: id(), groupId: element.groupId ? cloneGroups.get(element.groupId) : undefined, pageIndex: currentIndex + 1, sourceBoxId: element.sourceBoxId ? duplicateBoxIds.get(element.sourceBoxId) : undefined } as PdfCanvasElement];
      });
      const nextGuidesByPage: Record<number, { x: number[]; y: number[] }> = {};
      for (const [oldPage, guide] of Object.entries(guidesByPage)) {
        const mapped = mapPage(Number(oldPage));
        if (mapped !== null) nextGuidesByPage[mapped] = guide;
        if (action === "duplicate" && Number(oldPage) === currentIndex) nextGuidesByPage[currentIndex + 1] = { x: [...guide.x], y: [...guide.y] };
      }
      const bytes = await pdf.save();
      setUndoStack((stack) => [...stack.slice(-49), before]); setRedoStack([]);
      setOriginalBytes(bytes); setElements(nextElements); setEdits(nextEdits); setBoxesByPage(nextBoxesByPage); setGuidesByPage(nextGuidesByPage); setPageCount(pdf.getPageCount()); setPage(nextPage); setDocumentRevision((value) => value + 1);
      setSelectedId(null); setThumbnails({}); setLoadingPage(true);
    } catch (error) {
      console.error("PDF page operation failed", error); toast.error(labels.toolFailed);
    } finally { setBusy(false); }
  }

  async function resizeCurrentPage(width: number, height: number) {
    if (!originalBytes || !Number.isFinite(width) || !Number.isFinite(height)) return;
    setBusy(true);
    try {
      const before = snapshot();
      const pdf = await PDFDocument.load(originalBytes);
      pdf.getPage(page - 1).setSize(width, height);
      const bytes = await pdf.save();
      setUndoStack((stack) => [...stack.slice(-49), before]); setRedoStack([]);
      setOriginalBytes(bytes); setBoxesByPage((current) => { const next = { ...current }; delete next[page]; return next; }); setThumbnails({}); setDocumentRevision((value) => value + 1); setLoadingPage(true);
    } catch (error) {
      console.error("PDF page resize failed", error); toast.error(labels.toolFailed);
    } finally { setBusy(false); }
  }

  function setPageBackground(fill: string) {
    const existing = elements.find((element) => element.pageIndex === page - 1 && element.type === "shape" && element.isPageBackground);
    if (existing) {
      applyChange(elements.map((element) => element.id === existing.id ? { ...element, fill, stroke: fill } as PdfCanvasElement : element));
      return;
    }
    const background: CanvasShapeElement = { id: id(), name: tr ? "Sayfa arka planı" : "Page background", isPageBackground: true, type: "shape", shape: "rectangle", pageIndex: page - 1, x: 0, y: 0, width: 1, height: 1, rotation: 0, opacity: 1, fill, stroke: fill, strokeWidth: 0, locked: true };
    const firstOnPage = elements.findIndex((element) => element.pageIndex === page - 1);
    const next = [...elements];
    next.splice(firstOnPage < 0 ? next.length : firstOnPage, 0, background);
    applyChange(next);
  }

  function clearPageBackground() {
    const next = elements.filter((element) => !(element.pageIndex === page - 1 && element.isPageBackground));
    if (next.length !== elements.length) applyChange(next);
  }

  async function save() {
    if (!originalBytes || !file) return;
    const finalEdits = commitTextEdit();
    const report = analyzeEditorCapabilities(finalEdits, elements, security);
    if (exportMode === "standard" && !report.standardAllowed) {
      toast.error(tr ? "Bu değişiklik orijinal PDF yapısı korunarak güvenle dışa aktarılamıyor. Piksel eşlemeli modu seçin." : "This change cannot be exported safely while preserving the original PDF structure. Choose pixel-perfect mode.");
      return;
    }
    setBusy(true);
    try {
      let out: Uint8Array;
      if (!changeCount) {
        out = originalBytes.slice();
      } else if (exportMode === "standard") {
        out = await exportCanvasPdf(originalBytes, [], {}, persistedElements.filter(e => e.sourceOp === undefined && e.sourceBoxId === undefined && !e.hidden));
      } else {
        out = await exportFlattenedScenePdf(originalBytes, Object.values(boxesByPage).flat(), finalEdits, persistedElements);
      }
      const suffix = exportMode === "flattened" ? "pixel-perfect" : "edited";
      const result = { blob: new Blob([out as BlobPart], { type: "application/pdf" }), name: `${stem(file.name)}-${suffix}.pdf` };
      setSaved(result); setError("");
      downloadBlob(result.blob, result.name);
      toast.success(labels.toolDone);
    } catch (error) {
      console.error("PDF editor failed", error); toast.error(tr ? "PDF işlenemedi. Dosya bozuk veya parola korumalı olabilir. Yeniden deneyin." : "The PDF could not be processed. It may be damaged or password protected. Please retry.");
    } finally {
      setBusy(false);
    }
  }

  function resetAll() {
    if (!changeCount) return;
    setUndoStack((stack) => [...stack.slice(-49), snapshot()]); setRedoStack([]);
    setElements([]); setEdits({}); setDocumentRevision(0);
    setGuidesByPage({});
    if (sourceBytesRef.current) setOriginalBytes(sourceBytesRef.current);
    setBoxesByPage({}); setThumbnails({}); setPage(1); setLoadingPage(true);
    setSelectedId(null);
    setActive(null);
  }

  async function selectGraphic(operation: number) {
    const existing = elements.find(e => e.sourceOp === operation && e.pageIndex === page - 1);
    if (existing) { setSelectedId(existing.id); return; }
    if (!originalBytes) return;
    setBusy(true);
    const doc = await openPdf(originalBytes);
    try {
      const element = await extractSourceGraphic(await doc.getPage(page), operation);
      setElements([...elements, { ...element, sourcePristine: true }]); setSelectedId(element.id);
    } catch { toast.error(tr ? "Bu grafik ayrı bir nesne olarak çıkarılamadı." : "This graphic could not be extracted as an independent object."); }
    finally { await doc.loadingTask.destroy(); setBusy(false); }
  }

  async function saveProject() {
    if (!originalBytes || !file) return;
    const { encodeProject } = await import("@/lib/pdf/editor-project");
    const doc = await openPdf(originalBytes);
    try {
      const pages = [];
      for (let index = 0; index < doc.numPages; index += 1) {
        const pdfPage = await doc.getPage(index + 1);
        const viewport = pdfPage.getViewport({ scale: 1 });
        pages.push({ index, width: viewport.width, height: viewport.height, rotation: viewport.rotation });
      }
      downloadBlob(encodeProject({ fileName: file.name, bytes: originalBytes, elements: persistedElements, edits, boxesByPage, exportMode, pages, guidesByPage }), `${stem(file.name)}.cvproject`);
    } finally {
      await doc.loadingTask.destroy().catch(() => undefined);
    }
  }

  function selectedElements() {
    return elements.filter((element) => selectedIds.includes(element.id));
  }

  function groupSelection() {
    const targets = selectedElements();
    if (targets.length < 2) return;
    const groupId = id();
    applyChange(elements.map((element) => selectedIds.includes(element.id) ? { ...element, groupId } : element));
  }

  function ungroupSelection() {
    const groupIds = new Set(selectedElements().map((element) => element.groupId).filter(Boolean));
    if (!groupIds.size) return;
    applyChange(elements.map((element) => element.groupId && groupIds.has(element.groupId) ? { ...element, groupId: undefined } : element));
  }

  function alignSelection(axis: "left" | "center" | "right" | "top" | "middle" | "bottom") {
    const targets = selectedElements().filter((element) => !element.locked);
    if (targets.length < 2) return;
    const left = Math.min(...targets.map((element) => element.x));
    const right = Math.max(...targets.map((element) => element.x + element.width));
    const top = Math.min(...targets.map((element) => element.y));
    const bottom = Math.max(...targets.map((element) => element.y + element.height));
    applyChange(elements.map((element) => {
      if (!targets.some((target) => target.id === element.id)) return element;
      if (axis === "left") return { ...element, x: left };
      if (axis === "center") return { ...element, x: (left + right - element.width) / 2 };
      if (axis === "right") return { ...element, x: right - element.width };
      if (axis === "top") return { ...element, y: top };
      if (axis === "middle") return { ...element, y: (top + bottom - element.height) / 2 };
      return { ...element, y: bottom - element.height };
    }));
  }

  function distributeSelection(direction: "horizontal" | "vertical") {
    const targets = selectedElements().filter((element) => !element.locked).sort((a, b) => direction === "horizontal" ? a.x - b.x : a.y - b.y);
    if (targets.length < 3) return;
    const first = targets[0];
    const last = targets.at(-1)!;
    const start = direction === "horizontal" ? first.x : first.y;
    const end = direction === "horizontal" ? last.x : last.y;
    const positions = new Map(targets.map((element, index) => [element.id, start + (end - start) * index / (targets.length - 1)]));
    applyChange(elements.map((element) => !positions.has(element.id) ? element : direction === "horizontal" ? { ...element, x: positions.get(element.id)! } : { ...element, y: positions.get(element.id)! }));
  }

  function copySelection() {
    clipboardRef.current = selectedElements().map((element) => ({ ...element, sourceOp: undefined, sourceBoxId: undefined, sourcePristine: false, groupId: undefined }));
  }

  function pasteSelection() {
    if (!clipboardRef.current.length) return;
    const next = clipboardRef.current.map((element) => ({ ...element, id: id(), pageIndex: page - 1, x: clamp(element.x + 0.025, 0, 1 - element.width), y: clamp(element.y + 0.025, 0, 1 - element.height) }));
    applyChange([...elements, ...next]);
    setSelectedIds(next.map((element) => element.id));
    setPrimarySelectedId(next.at(-1)?.id ?? null);
  }

  async function openProject(file: File) {
    try {
      const { decodeProject } = await import("@/lib/pdf/editor-project");
      const project = await decodeProject(file);
      sourceBytesRef.current = project.bytes;
      setFile(new File([project.bytes as BlobPart], project.fileName, { type: "application/pdf" }));
      setOriginalBytes(project.bytes); setElements(project.elements); setEdits(project.edits); setBoxesByPage(project.boxesByPage);
      setExportMode(project.exportMode);
      setGuidesByPage(project.guidesByPage);
      setDocumentRevision(0);
      setPage(1); setSelectedId(null); setUndoStack([]); setRedoStack([]); setSaved(null); setThumbnails({}); setError("");
    } catch { toast.error(tr ? "Proje dosyası geçersiz veya desteklenmiyor." : "The project file is invalid or unsupported."); }
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (busy || target?.matches("input, textarea, select, [contenteditable='true']")) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo(); else undo();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
        event.preventDefault(); redo(); return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d" && selected) {
        event.preventDefault(); duplicateSelected(); return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c" && selectedIds.length) {
        event.preventDefault(); copySelection(); return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v" && clipboardRef.current.length) {
        event.preventDefault(); pasteSelection(); return;
      }
      if (event.key === "Escape") { setSelectedId(null); return; }
      if ((event.key === "Delete" || event.key === "Backspace") && selected) {
        event.preventDefault(); removeSelected(); return;
      }
      if (selected && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
        event.preventDefault();
        const step = event.shiftKey ? 0.01 : 0.002;
        const dx = event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0;
        const dy = event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0;
        patchSelected({ x: selected.allowOverflow ? selected.x + dx : clamp(selected.x + dx, 0, 1 - selected.width), y: selected.allowOverflow ? selected.y + dy : clamp(selected.y + dy, 0, 1 - selected.height) });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (!file) {
    return <div className="space-y-3"><p className="text-sm text-muted-foreground">{labels.editPdfGuide}</p><FileDrop accept="application/pdf,.pdf" onFiles={onFiles} /><label className="block cursor-pointer text-sm text-primary">{tr ? "Kaydedilmiş proje aç" : "Open saved project"}<input className="block mt-2" type="file" accept=".cvproject" onChange={e => { const f = e.target.files?.[0]; if (f) void openProject(f); }} /></label></div>;
  }

  return (
    <div aria-busy={busy} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {error && <div role="alert" className="flex flex-wrap items-center gap-3 border-b bg-destructive/5 p-4 text-sm text-destructive"><p>{error}</p><Button variant="outline" onClick={() => { setLoadingPage(true); setRenderVersion(v => v + 1); }}>{tr ? "Yeniden dene" : "Retry"}</Button></div>}
      {saved && <div role="status" className="flex flex-wrap items-center justify-between gap-3 border-b bg-primary/5 p-3 text-sm"><span className="break-all">{tr ? "Son indirilen dosya" : "Last downloaded file"}: {saved.name} · {formatBytes(saved.blob.size)}</span><Button size="sm" variant="outline" onClick={() => downloadBlob(saved.blob, saved.name)}>{tr ? "Tekrar indir" : "Download again"}</Button></div>}
      {busy && <p role="status" className="p-3 text-sm text-primary">{labels.processing}</p>}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-3 py-2.5">
        <Button size="sm" variant="outline" disabled={busy} onClick={() => setFile(null)}><FileUp data-icon="inline-start" />{labels.openAnotherPdf}</Button>
        <div className="hidden min-w-0 flex-1 sm:block"><p className="truncate text-sm font-medium">{file.name}</p><p className="text-xs text-muted-foreground">{labels.editPdfChanges.replace("{count}", String(changeCount))}</p></div>
        <Button size="icon-sm" variant="ghost" disabled={!undoStack.length} onClick={undo} aria-label={labels.undo}><Undo2 /></Button>
        <Button size="icon-sm" variant="ghost" disabled={!redoStack.length} onClick={redo} aria-label={labels.redo}><Redo2 /></Button>
        <Button size="icon-sm" variant="ghost" disabled={!changeCount} onClick={resetAll} aria-label={labels.resetEdits}><RotateCcw /></Button>
        {selectedIds.length > 1 ? <><Button size="sm" variant="outline" onClick={groupSelection}>{tr ? "Grupla" : "Group"}</Button><Button size="sm" variant="outline" onClick={() => alignSelection("center")}>{tr ? "Ortala" : "Align center"}</Button><Button size="sm" variant="outline" onClick={() => distributeSelection("horizontal")}>{tr ? "Yatay dağıt" : "Distribute"}</Button></> : null}
        {selectedElements().some((element) => element.groupId) ? <Button size="sm" variant="outline" onClick={ungroupSelection}>{tr ? "Grubu çöz" : "Ungroup"}</Button> : null}
        <span className="mx-1 h-6 w-px bg-border" />
        <Button size="icon-sm" variant="ghost" onClick={() => { setBoxes([]); setLoadingPage(true); setScale((value) => Math.max(0.2, value - 0.1)); }} aria-label={labels.zoomOut}><ZoomOut /></Button>
        <span className="w-11 text-center text-xs tabular-nums text-muted-foreground">{Math.round(scale * 100)}%</span>
        <Button size="icon-sm" variant="ghost" onClick={() => { setBoxes([]); setLoadingPage(true); setScale((value) => Math.min(2.4, value + 0.1)); }} aria-label={labels.zoomIn}><ZoomIn /></Button>
        <label className="sr-only" htmlFor="pdf-export-mode">{tr ? "PDF çıktı modu" : "PDF export mode"}</label>
        <select id="pdf-export-mode" className="h-8 rounded-md border border-input bg-background px-2 text-xs" value={exportMode} onChange={(event) => setExportMode(event.target.value as ExportMode)}>
          <option value="standard">{tr ? "Standart · seçilebilir" : "Standard · searchable"}</option>
          <option value="flattened">{tr ? "Piksel eşlemeli · 300 DPI" : "Pixel-perfect · 300 DPI"}</option>
        </select>
        <Button size="sm" onClick={() => void save()} disabled={busy || loadingPage || (exportMode === "standard" && !capabilities.standardAllowed)}><FileDown data-icon="inline-start" />{labels.downloadReady}</Button>
        <Button size="sm" variant="outline" onClick={() => void saveProject()} disabled={busy}>{tr ? "Projeyi kaydet" : "Save project"}</Button>
        <Button size="sm" variant="outline" onClick={() => projectInputRef.current?.click()} disabled={busy}>{tr ? "Proje aç" : "Open project"}</Button>
        <input ref={projectInputRef} hidden type="file" accept=".cvproject" onChange={e => { const f = e.target.files?.[0]; if (f) void openProject(f); e.currentTarget.value = ""; }} />
      </div>
      {exportMode === "standard" && !capabilities.standardAllowed ? <div role="alert" className="border-b border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"><strong>{tr ? "Standart çıktı güvenle üretilemez." : "Standard export is not safe."}</strong> {tr ? "Piksel eşlemeli modu seçin; bu mod metin seçilebilirliğini, form ve bağlantıları kaldırır." : "Choose pixel-perfect mode; it removes selectable text, forms, and links."}<ul className="mt-1 list-disc pl-5 text-xs">{capabilities.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></div> : null}
      {exportMode === "flattened" ? <div role="note" className="border-b bg-muted/70 px-4 py-2 text-xs text-muted-foreground">{tr ? "Piksel eşlemeli çıktı görünümü korur; metin seçilebilirliği, bağlantılar, formlar ve dijital imzalar korunmaz." : "Pixel-perfect export preserves appearance; selectable text, links, forms, and digital signatures are not preserved."}</div> : null}

      <div inert={busy} className="grid min-h-[680px] grid-cols-1 lg:grid-cols-[180px_minmax(0,1fr)_240px]">
        <aside className="hidden border-r border-border bg-card lg:block">
          <div className="grid grid-cols-2 gap-1 border-b border-border p-2">
            <ToolButton icon={<Type />} label={labels.addText} onClick={addText} />
            <ToolButton icon={<ImagePlus />} label={labels.addImage} onClick={() => imageInputRef.current?.click()} />
            <ToolButton icon={<Square />} label={labels.addRectangle} onClick={() => addShape("rectangle")} />
            <ToolButton icon={<Circle />} label={labels.addCircle} onClick={() => addShape("ellipse")} />
            <ToolButton icon={<Minus />} label={labels.addLine} onClick={() => addShape("line")} />
          </div>
          <input ref={imageInputRef} className="hidden" type="file" accept="image/png,image/jpeg" onChange={(event) => { const next = event.target.files?.[0]; if (next) void addImage(next); event.currentTarget.value = ""; }} />
          <p className="px-3 pb-2 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{labels.pages}</p>
          <div className="grid grid-cols-3 gap-1 px-3 pb-3"><Button size="sm" variant="outline" onClick={() => void mutatePages("add")}>{tr ? "Ekle" : "Add"}</Button><Button size="sm" variant="outline" onClick={() => void mutatePages("duplicate")}>{tr ? "Çoğalt" : "Duplicate"}</Button><Button size="sm" variant="outline" disabled={pageCount <= 1} onClick={() => void mutatePages("delete")}>{tr ? "Sil" : "Delete"}</Button><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => void mutatePages("up")} aria-label={tr ? "Sayfayı yukarı taşı" : "Move page up"}>↑</Button><Button size="sm" variant="outline" disabled={page >= pageCount} onClick={() => void mutatePages("down")} aria-label={tr ? "Sayfayı aşağı taşı" : "Move page down"}>↓</Button></div>
          <label className="mx-3 mb-3 block text-xs font-medium">{tr ? "Sayfa boyutu" : "Page size"}<select aria-label={tr ? "Sayfa boyutu" : "Page size"} defaultValue="" className="mt-1 h-8 w-full rounded-md border border-input bg-background px-2" onChange={event => { const [width, height] = event.target.value.split("x").map(Number); if (width && height) void resizeCurrentPage(width, height); event.currentTarget.value = ""; }}><option value="" disabled>{tr ? "Boyut seç…" : "Choose size…"}</option><option value="595.28x841.89">A4 · Portrait</option><option value="841.89x595.28">A4 · Landscape</option><option value="612x792">Letter · Portrait</option><option value="792x612">Letter · Landscape</option></select></label>
          <label className="mx-3 mb-3 flex items-center justify-between gap-2 text-xs font-medium">{tr ? "Sayfa arka planı" : "Page background"}<input aria-label={tr ? "Sayfa arka planı" : "Page background"} type="color" defaultValue="#ffffff" onChange={event => setPageBackground(event.target.value)} /></label>
          <Button className="mx-3 mb-3" size="sm" variant="ghost" onClick={clearPageBackground}>{tr ? "Arka planı kaldır" : "Remove background"}</Button>
          <div className="mx-3 mb-3 grid grid-cols-3 gap-1"><Button size="sm" variant="outline" onClick={() => setGuidesByPage((current) => ({ ...current, [page - 1]: { x: [...(current[page - 1]?.x ?? []), 0.5], y: current[page - 1]?.y ?? [] } }))}>{tr ? "Dikey kılavuz" : "V guide"}</Button><Button size="sm" variant="outline" onClick={() => setGuidesByPage((current) => ({ ...current, [page - 1]: { x: current[page - 1]?.x ?? [], y: [...(current[page - 1]?.y ?? []), 0.5] } }))}>{tr ? "Yatay kılavuz" : "H guide"}</Button><Button size="sm" variant="ghost" onClick={() => setGuidesByPage((current) => ({ ...current, [page - 1]: { x: [], y: [] } }))}>{tr ? "Temizle" : "Clear"}</Button></div>
          <div className="scrollbar-none max-h-[580px] space-y-3 overflow-y-auto px-3 pb-3">
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
              <button key={number} type="button" aria-label={`${tr ? "Sayfa" : "Page"} ${number}`} onClick={() => goToPage(number)} className="group block w-full">
                <span className={`relative block aspect-[0.707] overflow-hidden rounded-md border bg-white shadow-sm transition ${page === number ? "border-primary ring-2 ring-primary/20" : "border-border group-hover:border-primary/50"}`}>
                  {thumbnails[number] ? <span className="block size-full bg-cover bg-top" style={{ backgroundImage: `url(${thumbnails[number]})` }} /> : <span className="absolute inset-0 grid place-items-center text-sm font-semibold">{number}</span>}
                </span>
                <span className="mt-1 block text-center text-xs text-muted-foreground">{number}</span>
              </button>
            ))}
          </div>
        </aside>

        <section aria-label={tr ? "PDF belgesi" : "PDF document"} className="min-w-0 bg-muted">
          <div className="flex flex-wrap items-center justify-center gap-2 border-b border-border bg-card/90 px-3 py-2 lg:hidden">
            <Button size="icon-sm" variant="ghost" aria-label={labels.addText} onClick={addText}><Type /></Button><Button size="icon-sm" variant="ghost" aria-label={labels.addImage} onClick={() => imageInputRef.current?.click()}><ImagePlus /></Button><Button size="icon-sm" variant="ghost" aria-label={labels.addRectangle} onClick={() => addShape("rectangle")}><Square /></Button>
            <Button size="icon-sm" variant="ghost" aria-label={labels.addCircle} onClick={() => addShape("ellipse")}><Circle /></Button><Button size="icon-sm" variant="ghost" aria-label={labels.addLine} onClick={() => addShape("line")}><Minus /></Button>
            <span className="mx-2 h-5 w-px bg-border" />
            <Button size="icon-sm" variant="ghost" aria-label={labels.prevPage} disabled={page <= 1} onClick={() => goToPage(page - 1)}><ChevronLeft /></Button>
            <span className="text-xs">{page}/{pageCount}</span>
            <Button size="icon-sm" variant="ghost" aria-label={labels.nextPage} disabled={page >= pageCount} onClick={() => goToPage(page + 1)}><ChevronRight /></Button>
          </div>
          {empty ? <p className="border-b border-border bg-card px-4 py-2 text-sm text-muted-foreground">{labels.noClickableText} {labels.addLayerHint}</p> : null}
          <div ref={viewerRef} className="relative max-h-[65dvh] overflow-auto p-4 sm:p-8">
            {loadingPage ? <div className="absolute inset-x-0 top-3 z-20 mx-auto w-fit rounded-full bg-foreground px-3 py-1 text-xs text-background">{labels.processing}</div> : null}
            <div ref={pageRef} className="pdf-page relative mx-auto bg-white shadow-[0_24px_60px_rgb(15_23_42/0.18)]" style={{ width: size.width, height: size.height, backgroundColor: "#fff", ["--scale-factor" as string]: String(scale) }}>
              <div ref={canvasHostRef} className="absolute inset-0" />
              <div ref={layerRef} className="pdf-text-layer" onKeyDown={event => {
                if (event.key !== "Enter" && event.key !== " ") return;
                const target = (event.target as Element).closest("[data-box-id]");
                if (!(target instanceof HTMLElement)) return;
                const box = boxes.find(item => item.id === target.dataset.boxId);
                if (box) { event.preventDefault(); event.stopPropagation(); startEdit(box); }
              }} onPointerDown={(event) => {
                const target = (event.target as Element).closest("[data-box-id]");
                if (!(target instanceof HTMLElement)) return;
                const box = boxes.find((item) => item.id === target.dataset.boxId);
                if (!box) return;
                event.stopPropagation(); event.preventDefault(); startEdit(box);
              }} />
              {boxes.map((box) => {
                const value = edits[box.id];
                if (value === undefined || value === box.text || active?.id === box.id) return null;
                return <button key={box.id} type="button" className="pdf-edited-text" style={{ left: box.viewLeft, top: box.viewTop, minWidth: box.viewWidth, height: Math.max(box.viewHeight, 12), fontSize: Math.max(8, box.fontSize * scale), fontFamily: box.fontFamily, color: `rgb(${box.color.join(" ")})`, backgroundColor: `rgb(${box.bg.join(" ")})` }} onPointerDown={(event) => event.stopPropagation()} onClick={() => startEdit(box)}>{value || "\u00a0"}</button>;
              })}
              <div className="absolute inset-0 z-[3]">
                <PdfSceneStage
                  width={size.width}
                  height={size.height}
                  scale={scale}
                  elements={pageElements}
                  selectedIds={selectedIds}
                  userGuides={guidesByPage[page - 1] ?? { x: [], y: [] }}
                  onSelect={(elementId, additive) => {
                    if (!elementId) { setSelectedId(null); return; }
                    const target = elements.find((element) => element.id === elementId);
                    const groupedIds = target?.groupId ? elements.filter((element) => element.pageIndex === target.pageIndex && element.groupId === target.groupId).map((element) => element.id) : [elementId];
                    if (!additive) { setSelectedIds(groupedIds); setPrimarySelectedId(elementId); return; }
                    setSelectedIds((current) => {
                      const removing = groupedIds.every((id) => current.includes(id));
                      const next = removing ? current.filter((id) => !groupedIds.includes(id)) : [...new Set([...current, ...groupedIds])];
                      setPrimarySelectedId(next.at(-1) ?? null);
                      return next;
                    });
                  }}
                  onSelectMany={(ids) => { setSelectedIds(ids); setPrimarySelectedId(ids.at(-1) ?? null); }}
                  onPatch={(elementId, patch) => patchElement(elementId, patch)}
                  onPatchMany={patchElements}
                />
              </div>
              <div className="sr-only" aria-label={tr ? "Sayfadaki düzenlenebilir nesneler" : "Editable objects on page"}>{pageElements.filter(e => !e.hidden).map((element) => <button type="button" key={element.id} onClick={() => setSelectedId(element.id)}>{element.type === "text" ? element.text : element.type === "image" ? element.name : element.shape}</button>)}</div>
              {active ? <input aria-label={labels.text} ref={inputRef} value={active.text} className="pdf-text-editor" style={{ left: active.left, top: active.top, width: Math.max(active.width, active.text.length * active.fontSize * 0.54 + 10), height: active.height + 3, fontSize: active.fontSize, fontFamily: active.fontFamily, color: `rgb(${active.color.join(" ")})`, backgroundColor: `rgb(${active.bg.join(" ")})` }} onPointerDown={(event) => event.stopPropagation()} onChange={(event) => setActive({ ...active, text: event.target.value })} onBlur={commitTextEdit} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); commitTextEdit(); } if (event.key === "Escape") setActive(null); }} /> : null}
            </div>
          </div>
        </section>

        <aside className="border-t border-border bg-card p-4 lg:border-l lg:border-t-0">
          <div className="flex items-center gap-2"><Layers3 className="size-4" /><p className="text-sm font-semibold">{labels.properties}</p></div>
          {selected ? <PropertiesPanel element={selected} textOverflowing={selected.type === "text" && textLayoutMetrics(selected).requiredHeight > textLayoutMetrics(selected).availableHeight + 0.5} labels={labels} patch={patchSelected} duplicate={duplicateSelected} remove={removeSelected} moveLayer={moveLayer} replaceImage={replaceImage} uploadFont={uploadFont} /> : <div className="mt-10 text-center text-sm leading-relaxed text-muted-foreground"><Layers3 className="mx-auto mb-3 size-8 opacity-40" />{labels.selectLayerHint}</div>}
          <div className="mt-5 border-t pt-4"><h3 className="text-sm font-semibold">{tr ? "Katmanlar" : "Layers"}</h3><div className="mt-2 max-h-64 space-y-1 overflow-auto">
            {[...pageElements].reverse().map(e => <button key={e.id} type="button" draggable={!e.locked} aria-pressed={selectedId === e.id} onDragStart={event => event.dataTransfer.setData("application/x-pdf-layer", e.id)} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); reorderLayer(event.dataTransfer.getData("application/x-pdf-layer"), e.id); }} onClick={() => setSelectedId(e.id)} className={`block w-full truncate rounded p-2 text-left text-xs ${selectedId === e.id ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>{e.locked ? "🔒 " : ""}{e.hidden ? "◌ " : ""}{e.name || (e.type === "text" ? e.text || labels.newText : e.type === "image" ? e.name : e.shape)}</button>)}
          </div></div>
          <details className="mt-4 border-t pt-3"><summary className="cursor-pointer text-sm font-semibold">{tr ? "PDF içindeki nesneler" : "Original PDF objects"}</summary><div className="max-h-72 space-y-1 overflow-auto pt-2">
            {boxes.filter(b => b.text.trim()).map(b => <button type="button" key={b.id} onClick={() => startEdit(b)} className="block w-full truncate rounded p-2 text-left text-xs hover:bg-muted">T · {b.text}</button>)}
            {sourceGraphics.map((g, i) => <button type="button" key={g.operation} onClick={() => void selectGraphic(g.operation)} className="block w-full rounded p-2 text-left text-xs hover:bg-muted">◇ · {g.name} {i + 1}</button>)}
          </div></details>
        </aside>
      </div>
    </div>
  );
}

function ToolButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground [&_svg]:size-5">{icon}{label}</button>;
}

function PropertiesPanel({ element, textOverflowing, labels, patch, duplicate, remove, moveLayer, replaceImage, uploadFont }: {
  element: PdfCanvasElement;
  textOverflowing: boolean;
  labels: ReturnType<typeof useLabels>;
  patch: (patch: Partial<PdfCanvasElement>) => void;
  duplicate: () => void;
  remove: () => void;
  moveLayer: (direction: -1 | 1) => void;
  replaceImage: (file: File) => Promise<void>;
  uploadFont: (file: File) => Promise<void>;
}) {
  const tr = useDisplayLanguage() === "TR";
  const field = "h-9 w-full rounded-md border border-input bg-background px-2 text-sm";
  return <div className="mt-4 space-y-4">
    <label className="block text-xs font-medium">{tr ? "Katman adı" : "Layer name"}<input className={`mt-1 ${field}`} value={element.name ?? ""} placeholder={element.type === "text" ? element.text.slice(0, 32) : element.type === "image" ? element.name : element.shape} onChange={event => patch({ name: event.target.value || undefined })} /></label>
    <div className="flex flex-wrap gap-2"><Button size="sm" variant={element.locked ? "default" : "outline"} onClick={() => patch({ locked: !element.locked })}>{element.locked ? (tr ? "Kilidi aç" : "Unlock") : (tr ? "Kilitle" : "Lock")}</Button><Button size="sm" variant="outline" onClick={() => patch({ hidden: !element.hidden })}>{element.hidden ? (tr ? "Göster" : "Show") : (tr ? "Gizle" : "Hide")}</Button></div>
    <Button size="sm" variant={element.allowOverflow ? "default" : "outline"} onClick={() => patch({ allowOverflow: !element.allowOverflow })}>{tr ? "Sayfa dışına taşmaya izin ver" : "Allow outside page"}</Button>
    <div className="grid grid-cols-2 gap-2">{(["x", "y"] as const).map(axis => <NumberField key={axis} label={`${axis.toUpperCase()} (%)`} className={field} value={Number((element[axis] * 100).toFixed(1))} min={0} max={100} step={0.1} onCommit={value => patch({ [axis]: clamp(value / 100, 0, 1 - element[axis === "x" ? "width" : "height"]) })} />)}</div>
    <div className="flex flex-wrap gap-1">{(["left", "center", "right"] as const).map((align, i) => <Button key={align} size="sm" variant="outline" onClick={() => patch({ x: i * (1 - element.width) / 2 })}>{(tr ? ["Sol", "Orta", "Sağ"] : ["Left", "Center", "Right"])[i]}</Button>)}</div>
    <div className="grid grid-cols-2 gap-2">{(["width", "height"] as const).map((dimension, i) => <NumberField key={dimension} label={(tr ? ["Genişlik (%)", "Yükseklik (%)"] : ["Width (%)", "Height (%)"])[i]} className={field} value={Number((element[dimension] * 100).toFixed(1))} min={2} max={(1 - element[dimension === "width" ? "x" : "y"]) * 100} step={1} onCommit={value => patch({ [dimension]: clamp(value / 100, 0.02, 1 - element[dimension === "width" ? "x" : "y"]) })} />)}</div>

    {element.type === "text" ? <>
      <label className="block text-xs font-medium">{labels.text}<textarea className="mt-1 min-h-24 w-full resize-y rounded-md border border-input bg-background p-2 text-sm" value={element.text} onChange={(event) => patch({ text: event.target.value } as Partial<CanvasTextElement>)} /></label>
      <label className="block text-xs font-medium">{labels.font}<select className={`mt-1 ${field}`} value={element.fontDataUrl ? element.fontFamily : "Noto Sans"} onChange={(event) => patch({ fontFamily: event.target.value, fontDataUrl: undefined } as Partial<CanvasTextElement>)}><option>Noto Sans</option>{element.fontDataUrl ? <option value={element.fontFamily}>{tr ? "Yüklenen font" : "Uploaded font"}</option> : null}</select></label>
      <label className="block cursor-pointer text-xs font-medium text-primary">{tr ? "Font yükle (TTF/OTF/WOFF)" : "Upload font (TTF/OTF/WOFF)"}<input className="mt-1 block w-full text-xs" type="file" accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2" onChange={event => { const next = event.target.files?.[0]; if (next) void uploadFont(next); event.currentTarget.value = ""; }} /></label>
      <div className="grid grid-cols-2 gap-2"><NumberField label={labels.fontSize} className={field} value={element.fontSize} min={6} max={120} step={1} onCommit={value => patch({ fontSize: value } as Partial<CanvasTextElement>)} /><ColorField label={labels.color} value={element.color} onChange={(color) => patch({ color } as Partial<CanvasTextElement>)} /></div>
      <div className="grid grid-cols-2 gap-2"><NumberField label={tr ? "Satır yüksekliği" : "Line height"} className={field} value={element.lineHeight ?? 1.25} min={0.8} max={3} step={0.05} onCommit={value => patch({ lineHeight: value } as Partial<CanvasTextElement>)} /><NumberField label={tr ? "Harf aralığı" : "Letter spacing"} className={field} value={element.letterSpacing ?? 0} min={-5} max={30} step={0.1} onCommit={value => patch({ letterSpacing: value } as Partial<CanvasTextElement>)} /></div>
      <div className="flex gap-2"><Button size="sm" variant={element.autoHeight ? "default" : "outline"} onClick={() => patch({ autoHeight: !element.autoHeight, autoFit: false } as Partial<CanvasTextElement>)}>{tr ? "Otomatik yükseklik" : "Auto height"}</Button><Button size="sm" variant={element.autoFit ? "default" : "outline"} onClick={() => patch({ autoFit: !element.autoFit, autoHeight: false, autoFitMaxSize: element.fontSize } as Partial<CanvasTextElement>)}>{tr ? "Otomatik sığdır" : "Auto fit"}</Button></div>
      {textOverflowing && !element.autoFit && !element.autoHeight ? <p role="alert" className="rounded-md bg-amber-50 p-2 text-xs text-amber-900">{tr ? "Metin kutuya sığmıyor. Kutuyu büyütün veya otomatik sığdırmayı açın." : "Text overflows the box. Resize it or enable auto fit."}</p> : null}
      <div className="flex gap-1"><Button aria-label="Kalın / Bold" size="icon-sm" variant={element.bold ? "default" : "outline"} onClick={() => patch({ bold: !element.bold } as Partial<CanvasTextElement>)}><Bold /></Button><Button aria-label="İtalik / Italic" size="icon-sm" variant={element.italic ? "default" : "outline"} onClick={() => patch({ italic: !element.italic } as Partial<CanvasTextElement>)}><Italic /></Button>{(["left", "center", "right"] as const).map((align) => <Button key={align} aria-label={align === "left" ? "Sola hizala / Align left" : align === "center" ? "Ortala / Align center" : "Sağa hizala / Align right"} size="icon-sm" variant={element.align === align ? "default" : "outline"} onClick={() => patch({ align } as Partial<CanvasTextElement>)}>{align === "left" ? <AlignLeft /> : align === "center" ? <AlignCenter /> : <AlignRight />}</Button>)}</div>
    </> : null}
    {element.type === "shape" ? <div className="grid grid-cols-2 gap-2"><ColorField label={labels.fillColor} value={element.fill} onChange={(fill) => patch({ fill } as Partial<CanvasShapeElement>)} /><ColorField label={labels.borderColor} value={element.stroke} onChange={(stroke) => patch({ stroke } as Partial<CanvasShapeElement>)} /><NumberField label={labels.borderWidth} className={field} value={element.strokeWidth} min={0} max={20} step={0.5} onCommit={value => patch({ strokeWidth: value } as Partial<CanvasShapeElement>)} /><NumberField label={tr ? "Kesik çizgi" : "Dash length"} className={field} value={element.dash?.[0] ?? 0} min={0} max={100} step={1} onCommit={value => patch({ dash: value ? [value, value] : undefined } as Partial<CanvasShapeElement>)} />{element.shape === "rectangle" ? <NumberField label={tr ? "Köşe yarıçapı" : "Corner radius"} className={field} value={element.cornerRadius ?? 0} min={0} max={100} step={1} onCommit={value => patch({ cornerRadius: value } as Partial<CanvasShapeElement>)} /> : null}</div> : null}
    {element.type === "image" ? <><p className="truncate rounded-md bg-muted p-2 text-xs text-muted-foreground">{element.name}</p><label className="block cursor-pointer text-xs font-medium text-primary">{tr ? "Görseli değiştir" : "Replace image"}<input className="mt-1 block w-full text-xs" type="file" accept="image/png,image/jpeg" onChange={e => { const f = e.target.files?.[0]; if (f) void replaceImage(f); e.currentTarget.value = ""; }} /></label><div className="grid grid-cols-2 gap-2"><NumberField label={tr ? "Kırpma X (%)" : "Crop X (%)"} className={field} value={(element.crop?.x ?? 0) * 100} min={0} max={95} step={1} onCommit={value => patch({ crop: { x: value / 100, y: element.crop?.y ?? 0, width: Math.min(element.crop?.width ?? 1, 1 - value / 100), height: element.crop?.height ?? 1 } })} /><NumberField label={tr ? "Kırpma Y (%)" : "Crop Y (%)"} className={field} value={(element.crop?.y ?? 0) * 100} min={0} max={95} step={1} onCommit={value => patch({ crop: { x: element.crop?.x ?? 0, y: value / 100, width: element.crop?.width ?? 1, height: Math.min(element.crop?.height ?? 1, 1 - value / 100) } })} /><NumberField label={tr ? "Kırpma genişliği (%)" : "Crop width (%)"} className={field} value={(element.crop?.width ?? 1) * 100} min={5} max={(1 - (element.crop?.x ?? 0)) * 100} step={1} onCommit={value => patch({ crop: { x: element.crop?.x ?? 0, y: element.crop?.y ?? 0, width: value / 100, height: element.crop?.height ?? 1 } })} /><NumberField label={tr ? "Kırpma yüksekliği (%)" : "Crop height (%)"} className={field} value={(element.crop?.height ?? 1) * 100} min={5} max={(1 - (element.crop?.y ?? 0)) * 100} step={1} onCommit={value => patch({ crop: { x: element.crop?.x ?? 0, y: element.crop?.y ?? 0, width: element.crop?.width ?? 1, height: value / 100 } })} /><NumberField label={tr ? "Parlaklık" : "Brightness"} className={field} value={element.filters?.brightness ?? 0} min={-1} max={1} step={0.05} onCommit={value => patch({ filters: { brightness: value, contrast: element.filters?.contrast ?? 0, saturation: element.filters?.saturation ?? 0 } })} /><NumberField label={tr ? "Kontrast" : "Contrast"} className={field} value={element.filters?.contrast ?? 0} min={-100} max={100} step={1} onCommit={value => patch({ filters: { brightness: element.filters?.brightness ?? 0, contrast: value, saturation: element.filters?.saturation ?? 0 } })} /><NumberField label={tr ? "Doygunluk" : "Saturation"} className={field} value={element.filters?.saturation ?? 0} min={-1} max={1} step={0.05} onCommit={value => patch({ filters: { brightness: element.filters?.brightness ?? 0, contrast: element.filters?.contrast ?? 0, saturation: value } })} /></div></> : null}
    <div className="grid grid-cols-2 gap-2"><NumberField label={labels.rotation} className={field} value={element.rotation} min={-180} max={180} step={1} onCommit={value => patch({ rotation: value })} /><label className="text-xs font-medium">{labels.opacity}<input className="mt-3 w-full" type="range" min="0.1" max="1" step="0.05" value={element.opacity} onChange={(event) => patch({ opacity: Number(event.target.value) })} /></label></div>
    <div className="flex gap-2"><Button size="sm" variant={element.flipX ? "default" : "outline"} onClick={() => patch({ flipX: !element.flipX })}>{tr ? "Yatay çevir" : "Flip horizontal"}</Button><Button size="sm" variant={element.flipY ? "default" : "outline"} onClick={() => patch({ flipY: !element.flipY })}>{tr ? "Dikey çevir" : "Flip vertical"}</Button></div>
    <div className="border-t border-border pt-3"><p className="mb-2 text-xs font-medium">{labels.layerOrder}</p><div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => moveLayer(1)}><ChevronUp />{labels.forward}</Button><Button size="sm" variant="outline" onClick={() => moveLayer(-1)}><ChevronDown />{labels.backward}</Button></div></div>
    <div className="flex gap-2 border-t border-border pt-3"><Button className="flex-1" size="sm" variant="outline" onClick={duplicate}><Copy />{labels.duplicate}</Button><Button size="icon-sm" variant="destructive" onClick={remove} aria-label={labels.delete}><Trash2 /></Button></div>
  </div>;
}

function NumberField({ label, value, min, max, step, className, onCommit }: { label: string; value: number; min: number; max: number; step: number; className: string; onCommit: (value: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  const [previousValue, setPreviousValue] = useState(value);
  if (value !== previousValue) {
    setPreviousValue(value);
    setDraft(String(value));
  }
  function commit() {
    const parsed = Number(draft.replace(",", "."));
    if (!Number.isFinite(parsed)) { setDraft(String(value)); return; }
    const next = clamp(parsed, min, max);
    setDraft(String(next));
    onCommit(next);
  }
  return <label className="text-xs font-medium">{label}<input className={`mt-1 ${className}`} type="text" inputMode="decimal" value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={commit} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); if (event.key === "Escape") { setDraft(String(value)); event.currentTarget.blur(); } }} aria-label={label} data-step={step} /></label>;
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="text-xs font-medium">{label}<span className="mt-1 flex h-9 items-center gap-2 rounded-md border border-input bg-background px-2"><input type="color" className="size-5 cursor-pointer border-0 bg-transparent p-0" value={value} onChange={(event) => onChange(event.target.value)} /><span className="text-xs uppercase text-muted-foreground">{value}</span></span></label>;
}
