"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
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
import { FileDrop } from "@/components/tools/file-drop";
import { Button } from "@/components/ui/button";
import { downloadBlob, stem } from "@/lib/download";
import { exportCanvasPdf } from "@/lib/pdf/canvas-export";
import type { CanvasShapeElement, CanvasTextElement, EditorSnapshot, PdfCanvasElement } from "@/lib/pdf/canvas-types";
import { loadPdfjs, openPdf, renderPage } from "@/lib/pdf/pdfjs-client";
import { extractTextBoxes, type PdfTextBox } from "@/lib/pdf/text-layer";
import { useLabels } from "@/components/providers";

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

type Interaction = {
  pointerId: number;
  mode: "move" | "resize";
  startX: number;
  startY: number;
  element: PdfCanvasElement;
  snapshot: EditorSnapshot;
};

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
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const interactionRef = useRef<Interaction | null>(null);
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<EditorSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<EditorSnapshot[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);
  const [empty, setEmpty] = useState(false);

  const selected = elements.find((element) => element.id === selectedId) ?? null;
  const pageElements = elements.filter((element) => element.pageIndex === page - 1);
  const changeCount = Object.keys(edits).length + elements.length;

  useEffect(() => {
    if (!originalBytes || !layerRef.current || !canvasHostRef.current) return;
    let cancelled = false;
    const container = layerRef.current;
    const canvasHost = canvasHostRef.current;

    void (async () => {
      try {
        const pdfjs = await loadPdfjs();
        const doc = await openPdf(originalBytes);
        const pdfPage = await doc.getPage(page);
        const { canvas, viewport } = await renderPage(pdfPage, scale);
        if (cancelled) return;
        const nextBoxes = await extractTextBoxes(pdfPage, canvas, viewport);
        const content = await pdfPage.getTextContent();
        canvas.className = "pointer-events-none block select-none";
        canvasHost.replaceChildren(canvas);
        container.replaceChildren();
        const layer = new pdfjs.TextLayer({ textContentSource: content, container, viewport });
        await layer.render();
        if (cancelled) return layer.cancel();
        container.style.width = "100%";
        container.style.height = "100%";
        layer.textDivs.forEach((node, index) => {
          const box = nextBoxes[index];
          if (box?.text.trim() && node instanceof HTMLElement) node.dataset.boxId = box.id;
        });
        setPageCount(doc.numPages);
        setSize({ width: viewport.width, height: viewport.height });
        setBoxes(nextBoxes);
        setBoxesByPage((current) => ({ ...current, [page]: nextBoxes }));
        setEmpty(nextBoxes.every((box) => !box.text.trim()));
      } catch (error) {
        if (!cancelled) toast.error(error instanceof Error ? error.message : labels.toolFailed);
      } finally {
        if (!cancelled) setLoadingPage(false);
      }
    })();

    return () => {
      cancelled = true;
      container.replaceChildren();
      canvasHost.replaceChildren();
    };
  }, [originalBytes, page, scale, labels.toolFailed]);

  useEffect(() => {
    if (!originalBytes) return;
    let cancelled = false;
    void (async () => {
      const doc = await openPdf(originalBytes);
      for (let number = 1; number <= doc.numPages; number += 1) {
        const pdfPage = await doc.getPage(number);
        const { canvas } = await renderPage(pdfPage, 0.16);
        if (cancelled) return;
        const url = canvas.toDataURL("image/jpeg", 0.72);
        setThumbnails((current) => ({ ...current, [number]: url }));
      }
    })().catch(() => undefined);
    return () => { cancelled = true; };
  }, [originalBytes]);

  useEffect(() => {
    if (active) inputRef.current?.focus();
  }, [active]);

  function snapshot(): EditorSnapshot {
    return { edits, elements };
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
    setFile(next);
    setPage(1);
    setActive(null);
    setEdits({});
    setElements([]);
    setSelectedId(null);
    setUndoStack([]);
    setRedoStack([]);
    setBoxesByPage({});
    setThumbnails({});
    setLoadingPage(true);
    setOriginalBytes(new Uint8Array(await next.arrayBuffer()));
  }

  function startEdit(box: PdfTextBox) {
    setSelectedId(null);
    setActive({
      id: box.id,
      original: box.text,
      text: edits[box.id] ?? box.text,
      left: box.viewLeft,
      top: box.viewTop,
      width: Math.max(box.viewWidth, 24),
      height: Math.max(box.viewHeight, 12),
      fontSize: Math.max(8, box.fontSize * scale),
      fontFamily: box.fontFamily,
      color: box.color,
      bg: box.bg,
    });
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
    setElements(previous.elements);
    setEdits(previous.edits);
    setActive(null);
    setSelectedId(null);
  }

  function redo() {
    const next = redoStack.at(-1);
    if (!next) return;
    setUndoStack((stack) => [...stack, snapshot()]);
    setRedoStack((stack) => stack.slice(0, -1));
    setElements(next.elements);
    setEdits(next.edits);
    setActive(null);
    setSelectedId(null);
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
    const dataUrl = await readAsDataUrl(file);
    const bitmap = await createImageBitmap(file);
    const width = 0.32;
    const height = clamp(width * (size.width || 1) / (bitmap.width / bitmap.height) / (size.height || 1), 0.08, 0.5);
    bitmap.close();
    const element: PdfCanvasElement = { id: id(), type: "image", pageIndex: page - 1, x: 0.34, y: 0.32, width, height, rotation: 0, opacity: 1, dataUrl, name: file.name };
    applyChange([...elements, element]);
    setSelectedId(element.id);
  }

  function patchSelected(patch: Partial<PdfCanvasElement>) {
    if (!selected) return;
    applyChange(elements.map((element) => element.id === selected.id ? { ...element, ...patch } as PdfCanvasElement : element));
  }

  function removeSelected() {
    if (!selected) return;
    applyChange(elements.filter((element) => element.id !== selected.id));
    setSelectedId(null);
  }

  function duplicateSelected() {
    if (!selected) return;
    const copy = { ...selected, id: id(), x: clamp(selected.x + 0.025, 0, 1 - selected.width), y: clamp(selected.y + 0.025, 0, 1 - selected.height) };
    applyChange([...elements, copy]);
    setSelectedId(copy.id);
  }

  function moveLayer(direction: -1 | 1) {
    if (!selected) return;
    const index = elements.findIndex((element) => element.id === selected.id);
    const target = clamp(index + direction, 0, elements.length - 1);
    if (target === index) return;
    const next = [...elements];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    applyChange(next);
  }

  function beginInteraction(event: ReactPointerEvent<HTMLElement>, element: PdfCanvasElement, mode: Interaction["mode"]) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedId(element.id);
    interactionRef.current = { pointerId: event.pointerId, mode, startX: event.clientX, startY: event.clientY, element, snapshot: snapshot() };
  }

  function continueInteraction(event: ReactPointerEvent<HTMLElement>) {
    const interaction = interactionRef.current;
    const rect = pageRef.current?.getBoundingClientRect();
    if (!interaction || interaction.pointerId !== event.pointerId || !rect) return;
    const dx = (event.clientX - interaction.startX) / rect.width;
    const dy = (event.clientY - interaction.startY) / rect.height;
    setElements((current) => current.map((element) => {
      if (element.id !== interaction.element.id) return element;
      if (interaction.mode === "resize") {
        return { ...element, width: clamp(interaction.element.width + dx, 0.03, 1 - interaction.element.x), height: clamp(interaction.element.height + dy, 0.02, 1 - interaction.element.y) };
      }
      return { ...element, x: clamp(interaction.element.x + dx, 0, 1 - element.width), y: clamp(interaction.element.y + dy, 0, 1 - element.height) };
    }));
  }

  function endInteraction(event: ReactPointerEvent<HTMLElement>) {
    const interaction = interactionRef.current;
    if (!interaction || interaction.pointerId !== event.pointerId) return;
    setUndoStack((stack) => [...stack.slice(-49), interaction.snapshot]);
    setRedoStack([]);
    interactionRef.current = null;
  }

  function goToPage(nextPage: number) {
    commitTextEdit();
    setSelectedId(null);
    setBoxes([]);
    setLoadingPage(true);
    setPage(clamp(nextPage, 1, pageCount));
  }

  async function save() {
    if (!originalBytes || !file) return;
    const finalEdits = commitTextEdit();
    setBusy(true);
    try {
      const out = await exportCanvasPdf(originalBytes, Object.values(boxesByPage).flat(), finalEdits, elements);
      downloadBlob(new Blob([out as BlobPart], { type: "application/pdf" }), `${stem(file.name)}-edited.pdf`);
      toast.success(labels.toolDone);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : labels.toolFailed);
    } finally {
      setBusy(false);
    }
  }

  function resetAll() {
    if (!changeCount) return;
    applyChange([], {});
    setSelectedId(null);
    setActive(null);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo(); else undo();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
        event.preventDefault(); redo(); return;
      }
      if ((event.key === "Delete" || event.key === "Backspace") && selected) {
        event.preventDefault(); removeSelected(); return;
      }
      if (selected && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
        event.preventDefault();
        const step = event.shiftKey ? 0.01 : 0.002;
        const dx = event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0;
        const dy = event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0;
        patchSelected({ x: clamp(selected.x + dx, 0, 1 - selected.width), y: clamp(selected.y + dy, 0, 1 - selected.height) });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (!file) {
    return <div className="space-y-3"><p className="text-sm text-muted-foreground">{labels.editPdfGuide}</p><FileDrop accept="application/pdf,.pdf" onFiles={onFiles} /></div>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-3 py-2.5">
        <Button size="sm" variant="outline" onClick={() => setFile(null)}><FileUp data-icon="inline-start" />{labels.openAnotherPdf}</Button>
        <div className="hidden min-w-0 flex-1 sm:block"><p className="truncate text-sm font-medium">{file.name}</p><p className="text-xs text-muted-foreground">{labels.editPdfChanges.replace("{count}", String(changeCount))}</p></div>
        <Button size="icon-sm" variant="ghost" disabled={!undoStack.length} onClick={undo} aria-label={labels.undo}><Undo2 /></Button>
        <Button size="icon-sm" variant="ghost" disabled={!redoStack.length} onClick={redo} aria-label={labels.redo}><Redo2 /></Button>
        <Button size="icon-sm" variant="ghost" disabled={!changeCount} onClick={resetAll} aria-label={labels.resetEdits}><RotateCcw /></Button>
        <span className="mx-1 h-6 w-px bg-border" />
        <Button size="icon-sm" variant="ghost" onClick={() => { setBoxes([]); setLoadingPage(true); setScale((value) => Math.max(0.65, value - 0.1)); }} aria-label={labels.zoomOut}><ZoomOut /></Button>
        <span className="w-11 text-center text-xs tabular-nums text-muted-foreground">{Math.round(scale * 100)}%</span>
        <Button size="icon-sm" variant="ghost" onClick={() => { setBoxes([]); setLoadingPage(true); setScale((value) => Math.min(2.4, value + 0.1)); }} aria-label={labels.zoomIn}><ZoomIn /></Button>
        <Button size="sm" onClick={() => void save()} disabled={busy}><FileDown data-icon="inline-start" />{labels.downloadReady}</Button>
      </div>

      <div className="grid min-h-[680px] grid-cols-1 lg:grid-cols-[180px_minmax(0,1fr)_240px]">
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
          <div className="scrollbar-none max-h-[580px] space-y-3 overflow-y-auto px-3 pb-3">
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
              <button key={number} type="button" onClick={() => goToPage(number)} className="group block w-full">
                <span className={`relative block aspect-[0.707] overflow-hidden rounded-md border bg-white shadow-sm transition ${page === number ? "border-primary ring-2 ring-primary/20" : "border-border group-hover:border-primary/50"}`}>
                  {thumbnails[number] ? <span className="block size-full bg-cover bg-top" style={{ backgroundImage: `url(${thumbnails[number]})` }} /> : <span className="absolute inset-0 grid place-items-center text-sm font-semibold">{number}</span>}
                </span>
                <span className="mt-1 block text-center text-xs text-muted-foreground">{number}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0 bg-[#eceef2]">
          <div className="flex items-center justify-center gap-2 border-b border-border bg-card/90 px-3 py-2 lg:hidden">
            <Button size="icon-sm" variant="ghost" onClick={addText}><Type /></Button><Button size="icon-sm" variant="ghost" onClick={() => imageInputRef.current?.click()}><ImagePlus /></Button><Button size="icon-sm" variant="ghost" onClick={() => addShape("rectangle")}><Square /></Button>
            <span className="mx-2 h-5 w-px bg-border" />
            <Button size="icon-sm" variant="ghost" disabled={page <= 1} onClick={() => goToPage(page - 1)}><ChevronLeft /></Button>
            <span className="text-xs">{page}/{pageCount}</span>
            <Button size="icon-sm" variant="ghost" disabled={page >= pageCount} onClick={() => goToPage(page + 1)}><ChevronRight /></Button>
          </div>
          {empty ? <p className="border-b border-border bg-card px-4 py-2 text-sm text-muted-foreground">{labels.noClickableText} {labels.addLayerHint}</p> : null}
          <div className="relative max-h-[800px] overflow-auto p-4 sm:p-8" onPointerDown={() => { setSelectedId(null); commitTextEdit(); }}>
            {loadingPage ? <div className="absolute inset-x-0 top-3 z-20 mx-auto w-fit rounded-full bg-foreground px-3 py-1 text-xs text-background">{labels.processing}</div> : null}
            <div ref={pageRef} className="pdf-page relative mx-auto bg-white shadow-[0_24px_60px_rgb(15_23_42/0.18)]" style={{ width: size.width, height: size.height, ["--scale-factor" as string]: String(scale) }}>
              <div ref={canvasHostRef} className="absolute inset-0" />
              <div ref={layerRef} className="pdf-text-layer" onPointerDown={(event) => {
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
              {pageElements.map((element) => (
                <CanvasObject key={element.id} element={element} selected={selectedId === element.id} onSelect={() => setSelectedId(element.id)} onPointerDown={beginInteraction} onPointerMove={continueInteraction} onPointerUp={endInteraction} />
              ))}
              {active ? <input ref={inputRef} value={active.text} className="pdf-text-editor" style={{ left: active.left, top: active.top, width: Math.max(active.width, active.text.length * active.fontSize * 0.54 + 10), height: active.height + 3, fontSize: active.fontSize, fontFamily: active.fontFamily, color: `rgb(${active.color.join(" ")})`, backgroundColor: `rgb(${active.bg.join(" ")})` }} onPointerDown={(event) => event.stopPropagation()} onChange={(event) => setActive({ ...active, text: event.target.value })} onBlur={commitTextEdit} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); commitTextEdit(); } if (event.key === "Escape") setActive(null); }} /> : null}
            </div>
          </div>
        </main>

        <aside className="hidden border-l border-border bg-card p-4 lg:block">
          <div className="flex items-center gap-2"><Layers3 className="size-4" /><p className="text-sm font-semibold">{labels.properties}</p></div>
          {selected ? <PropertiesPanel element={selected} labels={labels} patch={patchSelected} duplicate={duplicateSelected} remove={removeSelected} moveLayer={moveLayer} /> : <div className="mt-10 text-center text-sm leading-relaxed text-muted-foreground"><Layers3 className="mx-auto mb-3 size-8 opacity-40" />{labels.selectLayerHint}</div>}
        </aside>
      </div>
    </div>
  );
}

function ToolButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground [&_svg]:size-5">{icon}{label}</button>;
}

function CanvasObject({ element, selected, onSelect, onPointerDown, onPointerMove, onPointerUp }: {
  element: PdfCanvasElement;
  selected: boolean;
  onSelect: () => void;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>, element: PdfCanvasElement, mode: Interaction["mode"]) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
}) {
  return (
    <div
      className={`absolute z-[5] touch-none select-none ${selected ? "outline-2 outline-offset-2 outline-violet-500" : "hover:outline hover:outline-1 hover:outline-violet-400/60"}`}
      style={{ left: `${element.x * 100}%`, top: `${element.y * 100}%`, width: `${element.width * 100}%`, height: `${element.height * 100}%`, opacity: element.opacity, transform: `rotate(${element.rotation}deg)`, transformOrigin: "center" }}
      onClick={(event) => { event.stopPropagation(); onSelect(); }}
      onPointerDown={(event) => onPointerDown(event, element, "move")}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {element.type === "text" ? <div className="size-full overflow-hidden whitespace-pre-wrap" style={{ fontFamily: element.fontFamily, fontSize: `${element.fontSize}px`, color: element.color, textAlign: element.align, fontWeight: element.bold ? 700 : 400, fontStyle: element.italic ? "italic" : "normal", lineHeight: 1.25 }}>{element.text}</div> : null}
      {element.type === "image" ? (
        // Local user-selected data URLs are not suitable for Next Image optimization.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={element.dataUrl} alt="" draggable={false} className="size-full object-fill" />
      ) : null}
      {element.type === "shape" && element.shape !== "line" ? <div className={`size-full ${element.shape === "ellipse" ? "rounded-full" : ""}`} style={{ backgroundColor: element.fill, border: `${element.strokeWidth}px solid ${element.stroke}` }} /> : null}
      {element.type === "shape" && element.shape === "line" ? <div className="absolute inset-x-0 top-1/2" style={{ borderTop: `${element.strokeWidth}px solid ${element.stroke}` }} /> : null}
      {selected ? <button type="button" aria-label="Resize" className="absolute -bottom-2 -right-2 size-4 cursor-nwse-resize rounded-full border-2 border-white bg-violet-600 shadow" onPointerDown={(event) => onPointerDown(event, element, "resize")} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} /> : null}
    </div>
  );
}

function PropertiesPanel({ element, labels, patch, duplicate, remove, moveLayer }: {
  element: PdfCanvasElement;
  labels: ReturnType<typeof useLabels>;
  patch: (patch: Partial<PdfCanvasElement>) => void;
  duplicate: () => void;
  remove: () => void;
  moveLayer: (direction: -1 | 1) => void;
}) {
  const field = "h-9 w-full rounded-md border border-input bg-background px-2 text-sm";
  return <div className="mt-4 space-y-4">
    {element.type === "text" ? <>
      <label className="block text-xs font-medium">{labels.text}<textarea className="mt-1 min-h-24 w-full resize-y rounded-md border border-input bg-background p-2 text-sm" value={element.text} onChange={(event) => patch({ text: event.target.value } as Partial<CanvasTextElement>)} /></label>
      <label className="block text-xs font-medium">{labels.font}<select className={`mt-1 ${field}`} value={element.fontFamily} onChange={(event) => patch({ fontFamily: event.target.value } as Partial<CanvasTextElement>)}><option>Noto Sans</option><option>Arial</option><option>Georgia</option><option>Courier New</option></select></label>
      <div className="grid grid-cols-2 gap-2"><label className="text-xs font-medium">{labels.fontSize}<input className={`mt-1 ${field}`} type="number" min="6" max="120" value={element.fontSize} onChange={(event) => patch({ fontSize: Number(event.target.value) } as Partial<CanvasTextElement>)} /></label><ColorField label={labels.color} value={element.color} onChange={(color) => patch({ color } as Partial<CanvasTextElement>)} /></div>
      <div className="flex gap-1"><Button size="icon-sm" variant={element.bold ? "default" : "outline"} onClick={() => patch({ bold: !element.bold } as Partial<CanvasTextElement>)}><Bold /></Button><Button size="icon-sm" variant={element.italic ? "default" : "outline"} onClick={() => patch({ italic: !element.italic } as Partial<CanvasTextElement>)}><Italic /></Button>{(["left", "center", "right"] as const).map((align) => <Button key={align} size="icon-sm" variant={element.align === align ? "default" : "outline"} onClick={() => patch({ align } as Partial<CanvasTextElement>)}>{align === "left" ? <AlignLeft /> : align === "center" ? <AlignCenter /> : <AlignRight />}</Button>)}</div>
    </> : null}
    {element.type === "shape" ? <div className="grid grid-cols-2 gap-2"><ColorField label={labels.fillColor} value={element.fill} onChange={(fill) => patch({ fill } as Partial<CanvasShapeElement>)} /><ColorField label={labels.borderColor} value={element.stroke} onChange={(stroke) => patch({ stroke } as Partial<CanvasShapeElement>)} /><label className="text-xs font-medium">{labels.borderWidth}<input className={`mt-1 ${field}`} type="number" min="0" max="20" value={element.strokeWidth} onChange={(event) => patch({ strokeWidth: Number(event.target.value) } as Partial<CanvasShapeElement>)} /></label></div> : null}
    {element.type === "image" ? <p className="truncate rounded-md bg-muted p-2 text-xs text-muted-foreground">{element.name}</p> : null}
    <div className="grid grid-cols-2 gap-2"><label className="text-xs font-medium">{labels.rotation}<input className={`mt-1 ${field}`} type="number" min="-180" max="180" value={element.rotation} onChange={(event) => patch({ rotation: Number(event.target.value) })} /></label><label className="text-xs font-medium">{labels.opacity}<input className="mt-3 w-full" type="range" min="0.1" max="1" step="0.05" value={element.opacity} onChange={(event) => patch({ opacity: Number(event.target.value) })} /></label></div>
    <div className="border-t border-border pt-3"><p className="mb-2 text-xs font-medium">{labels.layerOrder}</p><div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => moveLayer(1)}><ChevronUp />{labels.forward}</Button><Button size="sm" variant="outline" onClick={() => moveLayer(-1)}><ChevronDown />{labels.backward}</Button></div></div>
    <div className="flex gap-2 border-t border-border pt-3"><Button className="flex-1" size="sm" variant="outline" onClick={duplicate}><Copy />{labels.duplicate}</Button><Button size="icon-sm" variant="destructive" onClick={remove} aria-label={labels.delete}><Trash2 /></Button></div>
  </div>;
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="text-xs font-medium">{label}<span className="mt-1 flex h-9 items-center gap-2 rounded-md border border-input bg-background px-2"><input type="color" className="size-5 cursor-pointer border-0 bg-transparent p-0" value={value} onChange={(event) => onChange(event.target.value)} /><span className="text-xs uppercase text-muted-foreground">{value}</span></span></label>;
}
