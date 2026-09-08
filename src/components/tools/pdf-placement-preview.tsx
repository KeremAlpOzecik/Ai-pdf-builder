"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight, Grip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLabels } from "@/components/providers";
import { openPdf, renderPage } from "@/lib/pdf/pdfjs-client";
import type { PdfPlacement } from "@/lib/pdf/ops";

type PlacementKind = "watermark" | "signature" | "page-number";

type PdfPlacementPreviewProps = {
  file: File;
  kind: PlacementKind;
  placement: PdfPlacement;
  onPlacementChange: (placement: PdfPlacement) => void;
  text: string;
  signatureImage?: File;
};

export function PdfPlacementPreview({
  file,
  kind,
  placement,
  onPlacementChange,
  text,
  signatureImage,
}: PdfPlacementPreviewProps) {
  const labels = useLabels();
  const hostRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);
  const dragPointerRef = useRef<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [renderedSize, setRenderedSize] = useState({ width: 0, height: 0 });
  const [availableWidth, setAvailableWidth] = useState(720);
  const imageUrl = useMemo(
    () => (signatureImage ? URL.createObjectURL(signatureImage) : undefined),
    [signatureImage],
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const update = () => setAvailableWidth(Math.max(260, host.clientWidth - 32));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  useEffect(() => {
    let cancelled = false;
    async function draw() {
      const doc = await openPdf(await file.arrayBuffer());
      if (cancelled) return;
      const total = doc.numPages;
      setPageCount(total);
      const targetPage = kind === "signature" ? total : Math.min(page, total);
      if (targetPage !== page) setPage(targetPage);
      const pdfPage = await doc.getPage(targetPage);
      const base = pdfPage.getViewport({ scale: 1 });
      const scale = Math.min(1.15, availableWidth / base.width);
      const { canvas, viewport } = await renderPage(pdfPage, scale);
      if (cancelled || !canvasHostRef.current) return;
      canvas.className = "pointer-events-none block size-full select-none";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvasHostRef.current.replaceChildren(canvas);
      setRenderedSize({ width: viewport.width, height: viewport.height });
    }
    void draw();
    return () => {
      cancelled = true;
    };
  }, [availableWidth, file, kind, page]);

  function moveTo(clientX: number, clientY: number) {
    const pageRect = pageRef.current?.getBoundingClientRect();
    if (!pageRect) return;
    const itemRect = itemRef.current?.getBoundingClientRect();
    const halfX = itemRect ? Math.min(0.45, itemRect.width / pageRect.width / 2) : 0;
    const halfY = itemRect ? Math.min(0.45, itemRect.height / pageRect.height / 2) : 0;
    const x = (clientX - pageRect.left) / pageRect.width;
    const y = (clientY - pageRect.top) / pageRect.height;
    onPlacementChange({
      x: Math.max(halfX, Math.min(1 - halfX, x)),
      y: Math.max(halfY, Math.min(1 - halfY, y)),
    });
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    dragPointerRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    moveTo(event.clientX, event.clientY);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (dragPointerRef.current !== event.pointerId) return;
    moveTo(event.clientX, event.clientY);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const amount = event.shiftKey ? 0.03 : 0.01;
    const delta = {
      ArrowLeft: [-amount, 0],
      ArrowRight: [amount, 0],
      ArrowUp: [0, -amount],
      ArrowDown: [0, amount],
    }[event.key];
    if (!delta) return;
    event.preventDefault();
    onPlacementChange({
      x: Math.max(0, Math.min(1, placement.x + delta[0])),
      y: Math.max(0, Math.min(1, placement.y + delta[1])),
    });
  }

  const overlayText =
    kind === "watermark"
      ? text.trim() || "TASLAK"
      : kind === "page-number"
        ? `${page} / ${pageCount}`
        : text.trim() || labels.signaturePreviewFallback;
  const pageScale = renderedSize.width ? renderedSize.width / 595 : 1;

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-muted/30">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3">
        <div>
          <p className="text-sm font-semibold">{labels.outputPreview}</p>
          <p className="text-xs text-muted-foreground">{labels.dragPlacementHint}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {kind !== "signature" && pageCount > 1 ? (
            <>
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                aria-label={labels.prevPage}
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft />
              </Button>
              <span>{labels.pageLabel.replace("{page}", String(page)).replace("{total}", String(pageCount))}</span>
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                aria-label={labels.nextPage}
                disabled={page >= pageCount}
                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              >
                <ChevronRight />
              </Button>
            </>
          ) : (
            <span>
              {kind === "signature"
                ? labels.lastPagePreview.replace("{page}", String(pageCount))
                : labels.pageLabel.replace("{page}", "1").replace("{total}", "1")}
            </span>
          )}
        </div>
      </div>
      <div ref={hostRef} className="overflow-auto p-4 sm:p-6">
        <div
          ref={pageRef}
          className="relative mx-auto overflow-hidden bg-white shadow-[0_18px_45px_rgb(28_25_23/0.18)]"
          style={{ width: renderedSize.width || 595, height: renderedSize.height || 842 }}
        >
          <div ref={canvasHostRef} className="absolute inset-0" />
          <div
            ref={itemRef}
            role="button"
            tabIndex={0}
            aria-label={labels.dragPlacementAria}
            className="absolute z-10 cursor-grab touch-none select-none rounded-md outline-none ring-primary/60 active:cursor-grabbing focus-visible:ring-2"
            style={{
              left: `${placement.x * 100}%`,
              top: `${placement.y * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={() => (dragPointerRef.current = null)}
            onPointerCancel={() => (dragPointerRef.current = null)}
            onKeyDown={onKeyDown}
          >
            {kind === "watermark" ? (
              <div
                className="flex items-center gap-2 whitespace-nowrap border border-dashed border-slate-500/50 bg-white/10 px-2 py-1 font-semibold tracking-[0.08em] text-slate-600/45"
                style={{ fontSize: Math.max(28, 48 * pageScale), transform: "rotate(-32deg)" }}
              >
                <Grip className="size-4 shrink-0" />
                {overlayText}
              </div>
            ) : kind === "signature" ? (
              <div className="flex min-w-24 flex-col items-center rounded-md border border-dashed border-primary/60 bg-white/70 px-2 py-1 text-slate-900 shadow-sm">
                {imageUrl ? (
                  // A local object URL is the actual signature the user selected.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt=""
                    className="block object-contain"
                    style={{ width: Math.min(180, 190 * pageScale), maxHeight: 110 * pageScale }}
                  />
                ) : null}
                <span className="whitespace-nowrap" style={{ fontSize: Math.max(14, 16 * pageScale) }}>
                  {overlayText}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 whitespace-nowrap rounded border border-dashed border-primary/60 bg-white/85 px-2 py-1 text-slate-700 shadow-sm">
                <Grip className="size-3.5" />
                <span style={{ fontSize: Math.max(10, 10 * pageScale) }}>{overlayText}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
