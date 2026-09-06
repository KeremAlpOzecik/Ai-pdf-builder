"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, FileDown, ZoomIn, ZoomOut } from "lucide-react";
import { toast } from "sonner";
import { FileDrop } from "@/components/tools/file-drop";
import { Button } from "@/components/ui/button";
import { downloadBlob, stem } from "@/lib/download";
import { applyTextEdits } from "@/lib/pdf/apply-edits";
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
};

export function EditPdfEditor() {
  const labels = useLabels();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [pageCount, setPageCount] = useState(1);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.5);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [boxes, setBoxes] = useState<PdfTextBox[]>([]);
  const [active, setActive] = useState<ActiveEdit | null>(null);
  const [busy, setBusy] = useState(false);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    if (!bytes || !layerRef.current || !canvasHostRef.current) return;
    let cancelled = false;
    const container = layerRef.current;
    const canvasHost = canvasHostRef.current;

    void (async () => {
      try {
        const pdfjs = await loadPdfjs();
        const doc = await openPdf(bytes);
        const pdfPage = await doc.getPage(page);
        const { canvas, viewport } = await renderPage(pdfPage, scale);
        if (cancelled) return;
        const nextBoxes = await extractTextBoxes(pdfPage, canvas, viewport);
        const content = await pdfPage.getTextContent();
        canvas.className = "pointer-events-none block select-none";
        canvasHost.replaceChildren(canvas);
        container.replaceChildren();
        const layer = new pdfjs.TextLayer({
          textContentSource: content,
          container,
          viewport,
        });
        await layer.render();
        if (cancelled) {
          layer.cancel();
          return;
        }
        container.style.width = "100%";
        container.style.height = "100%";
        layer.textDivs.forEach((node, index) => {
          const box = nextBoxes[index];
          if (!box || !(node instanceof HTMLElement) || !box.text.trim()) return;
          node.dataset.boxId = box.id;
        });
        setPageCount(doc.numPages);
        setSize({ width: viewport.width, height: viewport.height });
        setBoxes(nextBoxes);
        setEmpty(nextBoxes.filter((box) => box.text.trim()).length === 0);
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : labels.toolFailed);
        }
      }
    })();

    return () => {
      cancelled = true;
      container.replaceChildren();
      canvasHost.replaceChildren();
    };
  }, [bytes, page, scale, labels.toolFailed]);

  useEffect(() => {
    if (active) inputRef.current?.focus();
  }, [active]);

  async function onFiles(files: File[]) {
    const next = files[0];
    if (!next) return;
    setFile(next);
    setActive(null);
    setPage(1);
    const buf = await next.arrayBuffer();
    setBytes(new Uint8Array(buf));
  }

  function hitSpan(clientX: number, clientY: number) {
    const layer = layerRef.current;
    if (!layer) return null;
    const direct = document.elementFromPoint(clientX, clientY);
    const nested = direct?.closest("[data-box-id]");
    if (nested instanceof HTMLElement && layer.contains(nested)) return nested;

    let best: HTMLElement | null = null;
    let bestDist = 14;
    for (const node of layer.querySelectorAll("[data-box-id]")) {
      const span = node as HTMLElement;
      const r = span.getBoundingClientRect();
      const dx = clientX < r.left ? r.left - clientX : clientX > r.right ? clientX - r.right : 0;
      const dy = clientY < r.top ? r.top - clientY : clientY > r.bottom ? clientY - r.bottom : 0;
      const dist = Math.hypot(dx, dy);
      if (dist < bestDist) {
        bestDist = dist;
        best = span;
      }
    }
    return best;
  }

  function startEdit(span: HTMLElement) {
    const root = wrapRef.current;
    if (!span.dataset.boxId || !root) return;
    const box = boxes.find((item) => item.id === span.dataset.boxId);
    if (!box) return;
    const a = span.getBoundingClientRect();
    const b = root.getBoundingClientRect();
    setActive({
      id: box.id,
      original: box.text,
      text: box.text,
      left: a.left - b.left,
      top: a.top - b.top,
      width: Math.max(a.width, 24),
      height: Math.max(a.height, 12),
      fontSize: Math.max(9, a.height * 0.92),
    });
  }

  async function commit() {
    if (!active || !bytes) {
      setActive(null);
      return null;
    }
    const nextText = active.text;
    if (nextText === active.original) {
      setActive(null);
      return bytes;
    }
    setBusy(true);
    try {
      const out = await applyTextEdits(bytes, boxes, { [active.id]: nextText });
      const next = Uint8Array.from(out);
      setBytes(next);
      setActive(null);
      return next;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : labels.toolFailed);
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!bytes || !file) return;
    const payload = active ? await commit() : bytes;
    if (!payload) return;
    downloadBlob(new Blob([payload as BlobPart], { type: "application/pdf" }), `${stem(file.name)}-edited.pdf`);
    toast.success(labels.toolDone);
  }

  if (!file) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">{labels.editPdfGuide}</p>
        <FileDrop accept="application/pdf,.pdf" onFiles={onFiles} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="mr-auto text-sm font-medium">{file.name}</p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setScale((value) => Math.max(0.8, Number((value - 0.15).toFixed(2))))}
          aria-label={labels.zoomOut}
        >
          <ZoomOut />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setScale((value) => Math.min(2.4, Number((value + 0.15).toFixed(2))))}
          aria-label={labels.zoomIn}
        >
          <ZoomIn />
        </Button>
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
          <ChevronLeft />
          {labels.prevPage}
        </Button>
        <span className="text-xs text-muted-foreground">
          {labels.pageLabel.replace("{page}", String(page)).replace("{total}", String(pageCount))}
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={page >= pageCount}
          onClick={() => setPage((value) => value + 1)}
        >
          {labels.nextPage}
          <ChevronRight />
        </Button>
        <Button size="sm" onClick={() => void save()} disabled={busy}>
          <FileDown data-icon="inline-start" />
          {labels.downloadReady}
        </Button>
      </div>
      {empty ? <p className="text-sm text-muted-foreground">{labels.noClickableText}</p> : null}
      <div className="overflow-auto rounded-xl border border-border bg-[oklch(0.93_0.014_80)] p-4">
        <div
          ref={wrapRef}
          className="pdf-page relative mx-auto bg-white shadow-[0_24px_60px_rgb(28_25_23/0.12)]"
          style={{
            width: size.width,
            height: size.height,
            ["--scale-factor" as string]: String(scale),
          }}
        >
          <div ref={canvasHostRef} className="absolute inset-0" />
          <div
            ref={layerRef}
            className="pdf-text-layer"
            onMouseDown={(event) => {
              const span = hitSpan(event.clientX, event.clientY);
              if (!span) return;
              event.preventDefault();
              startEdit(span);
            }}
          />
          {active ? (
            <input
              ref={inputRef}
              value={active.text}
              className="pdf-text-editor"
              style={{
                left: active.left,
                top: active.top,
                width: Math.max(active.width, active.text.length * active.fontSize * 0.52 + 8),
                height: active.height + 2,
                fontSize: active.fontSize,
              }}
              onChange={(event) => setActive({ ...active, text: event.target.value })}
              onBlur={() => void commit()}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void commit();
                }
                if (event.key === "Escape") {
                  setActive(null);
                }
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
