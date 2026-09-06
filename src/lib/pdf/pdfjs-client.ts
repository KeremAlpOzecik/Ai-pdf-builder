import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from "pdfjs-dist";

function installCollectionPolyfills() {
  const maps = [Map.prototype, WeakMap.prototype] as const;
  for (const proto of maps) {
    const target = proto as typeof proto & {
      getOrInsertComputed?: (key: never, fn: (key: never) => unknown) => unknown;
      getOrInsert?: (key: never, value: unknown) => unknown;
    };
    if (typeof target.getOrInsertComputed !== "function") {
      Object.defineProperty(target, "getOrInsertComputed", {
        configurable: true,
        value(this: Map<unknown, unknown>, key: unknown, callback: (key: unknown) => unknown) {
          if (this.has(key as never)) return this.get(key as never);
          const value = callback(key);
          this.set(key as never, value as never);
          return value;
        },
      });
    }
    if (typeof target.getOrInsert !== "function") {
      Object.defineProperty(target, "getOrInsert", {
        configurable: true,
        value(this: Map<unknown, unknown>, key: unknown, value: unknown) {
          if (!this.has(key as never)) this.set(key as never, value as never);
          return this.get(key as never);
        },
      });
    }
  }
}

export async function loadPdfjs() {
  installCollectionPolyfills();
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return pdfjs;
}

export async function openPdf(data: ArrayBuffer | Uint8Array): Promise<PDFDocumentProxy> {
  const pdfjs = await loadPdfjs();
  const copy = data instanceof Uint8Array ? data.slice() : new Uint8Array(data.slice(0));
  return pdfjs.getDocument({ data: copy }).promise;
}

export async function renderPage(
  page: PDFPageProxy,
  scale: number,
): Promise<{ canvas: HTMLCanvasElement; viewport: PageViewport }> {
  const viewport = page.getViewport({ scale });
  const outputScale = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width * outputScale);
  canvas.height = Math.floor(viewport.height * outputScale);
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  const transform = outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0];
  await page.render({
    canvas,
    canvasContext: ctx,
    viewport,
    ...(transform ? { transform } : {}),
  }).promise;
  return { canvas, viewport };
}

export async function renderPageToCanvas(page: PDFPageProxy, scale: number) {
  const { canvas } = await renderPage(page, scale);
  return canvas;
}
