"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { useDisplayLanguage, useLabels } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { openPdf, renderPage } from "@/lib/pdf/pdfjs-client";

type PreviewSize = { width: number; height: number };

export function PdfRotatePreview({
  file,
  angle,
}: {
  file: File;
  angle: 90 | 180 | 270;
}) {
  const labels = useLabels();
  const tr = useDisplayLanguage() === "TR";
  const [previewError, setPreviewError] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const beforeRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [availableWidth, setAvailableWidth] = useState(720);
  const [beforeSize, setBeforeSize] = useState<PreviewSize>({ width: 0, height: 0 });
  const [afterSize, setAfterSize] = useState<PreviewSize>({ width: 0, height: 0 });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const update = () => setAvailableWidth(Math.max(260, host.clientWidth));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function draw() {
      const doc = await openPdf(await file.arrayBuffer());
      if (cancelled) return;
      setPageCount(doc.numPages);
      const targetPage = Math.min(page, doc.numPages);
      if (targetPage !== page) setPage(targetPage);
      const pdfPage = await doc.getPage(targetPage);
      const originalRotation = pdfPage.rotate;
      const resultRotation = (originalRotation + angle) % 360;
      const paneWidth = availableWidth >= 640 ? (availableWidth - 40) / 2 : availableWidth - 32;

      async function drawVersion(rotation: number, target: HTMLDivElement | null) {
        if (!target) return { width: 0, height: 0 };
        const base = pdfPage.getViewport({ scale: 1, rotation });
        const scale = Math.min(1.15, paneWidth / base.width, 380 / base.height);
        const { canvas, viewport } = await renderPage(pdfPage, scale, rotation);
        if (cancelled) return { width: 0, height: 0 };
        canvas.className = "pointer-events-none block size-full select-none";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        target.replaceChildren(canvas);
        return { width: viewport.width, height: viewport.height };
      }

      const [before, after] = await Promise.all([
        drawVersion(originalRotation, beforeRef.current),
        drawVersion(resultRotation, afterRef.current),
      ]);
      if (!cancelled) {
        setBeforeSize(before);
        setAfterSize(after);
      }
    }

    void draw().catch(() => { if (!cancelled) setPreviewError(true); });
    return () => {
      cancelled = true;
    };
  }, [angle, availableWidth, file, page]);

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-muted/30">
      {previewError && <p role="alert" className="p-4 text-sm text-destructive">{tr ? "Önizleme yüklenemedi. Başka bir PDF seçin veya işlemi yeniden deneyin." : "Preview could not load. Choose another PDF or retry the operation."}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{labels.rotatePreviewTitle}</p>
          <p className="truncate text-xs text-muted-foreground">{file.name}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
        </div>
      </div>

      <div ref={hostRef} className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
        <PreviewCard label={labels.rotateBefore} canvasRef={beforeRef} size={beforeSize} />
        <PreviewCard
          label={labels.rotateAfter.replace("{angle}", String(angle))}
          canvasRef={afterRef}
          size={afterSize}
          accent
        />
      </div>
    </section>
  );
}

function PreviewCard({
  label,
  canvasRef,
  size,
  accent = false,
}: {
  label: string;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  size: PreviewSize;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-xl border bg-background p-3 ${accent ? "border-primary/40 ring-1 ring-primary/10" : "border-border"}`}>
      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
        {accent ? <RotateCw className="size-4 text-primary" aria-hidden="true" /> : null}
        <span>{label}</span>
      </div>
      <div className="flex min-h-64 items-center justify-center overflow-auto rounded-lg bg-muted/55 p-3">
        <div
          ref={canvasRef}
          className="overflow-hidden bg-white shadow-[0_12px_32px_rgb(28_25_23/0.16)]"
          style={{ width: size.width || 220, height: size.height || 300 }}
        />
      </div>
    </div>
  );
}
