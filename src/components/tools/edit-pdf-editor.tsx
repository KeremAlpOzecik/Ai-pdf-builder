"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ImagePlus,
  Minus,
  Plus,
  Redo2,
  Square,
  Trash2,
  Type,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FileDrop } from "@/components/tools/file-drop";
import { useDisplayLanguage } from "@/components/providers";
import { downloadBlob, stem } from "@/lib/download";
import { MAX_FILE_BYTES } from "@/lib/tools";
import { openPdf, renderPage } from "@/lib/pdf/pdfjs-client";
import { ensureEditorFonts } from "@/lib/pdf/editor-fonts";
import { layoutTextLines } from "@/lib/pdf/text-layout";
import { exportSimplePdf } from "@/lib/pdf/simple-export";
import { decodeProject, encodeProject } from "@/lib/pdf/editor-project";
import { readEditorDraft, writeEditorDraft } from "@/lib/pdf/editor-draft";
import type {
  CanvasTextElement,
  PdfCanvasElement,
} from "@/lib/pdf/canvas-types";

type PageSize = {
  index: number;
  width: number;
  height: number;
  rotation: number;
};
type Drag = {
  id: string;
  pointer: number;
  x: number;
  y: number;
  rect: DOMRect;
  element: PdfCanvasElement;
  resize: boolean;
  before: PdfCanvasElement[];
};
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
const DRAFT = "simple-editor";

function fitText(
  element: CanvasTextElement,
  dimensions: PageSize,
): CanvasTextElement {
  const ctx = document.createElement("canvas").getContext("2d");
  if (ctx)
    ctx.font = `${element.bold ? 700 : 400} ${element.fontSize}px 'Noto Sans'`;
  const measure = (text: string) =>
    ctx?.measureText(text).width ?? text.length * element.fontSize * 0.6;
  const lines = layoutTextLines(
    element.text,
    element.width * dimensions.width,
    Number.MAX_SAFE_INTEGER,
    element.fontSize,
    1.25,
    measure,
  );
  return {
    ...element,
    height: Math.min(
      1 - element.y,
      Math.max(
        0.025,
        (lines.length * element.fontSize * 1.25 + 2) / dimensions.height,
      ),
    ),
  };
}

export function EditPdfEditor() {
  const tr = useDisplayLanguage() === "TR";
  const t = (turkish: string, english: string) => (tr ? turkish : english);
  const [file, setFile] = useState<File | null>(null);
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [pages, setPages] = useState<PageSize[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [elements, setElements] = useState<PdfCanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [undo, setUndo] = useState<PdfCanvasElement[][]>([]);
  const [redo, setRedo] = useState<PdfCanvasElement[][]>([]);
  const [busy, setBusy] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [recovery, setRecovery] = useState<Blob | null>(null);
  const [draftFailed, setDraftFailed] = useState(false);
  const [viewerWidth, setViewerWidth] = useState(600);
  const [zoom, setZoom] = useState(1);
  const canvasHost = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const drag = useRef<Drag | null>(null);
  const selected = elements.find((element) => element.id === selectedId);
  const currentPage = pages[pageIndex];
  const scale = currentPage
    ? Math.max(0.1, Math.min(1.15, (viewerWidth - 24) / currentPage.width)) *
      zoom
    : 1;

  useEffect(() => {
    void ensureEditorFonts().catch(() => undefined);
    void readEditorDraft(DRAFT)
      .then((blob) => setRecovery(blob ?? null))
      .catch(() => undefined);
  }, []);
  useEffect(() => {
    if (!viewerRef.current) return;
    const observer = new ResizeObserver((entries) =>
      setViewerWidth(entries[0].contentRect.width),
    );
    observer.observe(viewerRef.current);
    return () => observer.disconnect();
  }, [file]);
  useEffect(() => {
    if (!bytes || !canvasHost.current || !currentPage) return;
    let cancelled = false;
    const host = canvasHost.current;
    let doc: Awaited<ReturnType<typeof openPdf>> | undefined;
    setRendering(true);
    void (async () => {
      try {
        doc = await openPdf(bytes);
        const { canvas } = await renderPage(
          await doc.getPage(pageIndex + 1),
          scale,
        );
        if (!cancelled) {
          host.replaceChildren(canvas);
          setError("");
        }
      } catch {
        if (!cancelled)
          setError(
            t(
              "Sayfa görüntülenemedi. PDF’yi yeniden açmayı dene.",
              "Could not display this page. Try reopening the PDF.",
            ),
          );
      } finally {
        if (!cancelled) setRendering(false);
        await doc?.loadingTask.destroy().catch(() => undefined);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Language does not change the rendered page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bytes, pageIndex, scale, currentPage]);
  useEffect(() => {
    if (!bytes || !file || !pages.length) return;
    const timer = window.setTimeout(() => {
      const blob = encodeProject({
        fileName: file.name,
        bytes,
        elements,
        edits: {},
        boxesByPage: {},
        exportMode: "standard",
        pages,
        guidesByPage: {},
      });
      void writeEditorDraft(blob, DRAFT)
        .then(() => setDraftFailed(false))
        .catch(() => setDraftFailed(true));
    }, 700);
    return () => window.clearTimeout(timer);
  }, [bytes, file, pages, elements]);
  useEffect(() => {
    if (!elements.length) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [elements.length]);

  function change(next: PdfCanvasElement[]) {
    setUndo((history) => [...history.slice(-49), elements]);
    setRedo([]);
    setElements(next);
  }
  function patch(patchValue: Partial<PdfCanvasElement>) {
    if (!selected || !currentPage) return;
    change(
      elements.map((element) => {
        if (element.id !== selected.id) return element;
        const next = { ...element, ...patchValue } as PdfCanvasElement;
        return next.type === "text" ? fitText(next, currentPage) : next;
      }),
    );
  }
  async function load(fileValue: File, restored: PdfCanvasElement[] = []) {
    setBusy(true);
    setError("");
    let doc: Awaited<ReturnType<typeof openPdf>> | undefined;
    try {
      const value = new Uint8Array(await fileValue.arrayBuffer());
      doc = await openPdf(value);
      const sizes: PageSize[] = [];
      for (let index = 0; index < doc.numPages; index++) {
        const viewport = (await doc.getPage(index + 1)).getViewport({
          scale: 1,
        });
        sizes.push({
          index,
          width: viewport.width,
          height: viewport.height,
          rotation: viewport.rotation,
        });
      }
      if (restored.some((element) => element.pageIndex >= sizes.length))
        throw new Error("Invalid page");
      setFile(fileValue);
      setBytes(value);
      setPages(sizes);
      setElements(restored);
      setPageIndex(0);
      setSelectedId(null);
      setUndo([]);
      setRedo([]);
      setZoom(1);
      setRecovery(null);
    } catch {
      setError(
        t(
          "PDF açılamadı. Geçerli, parolasız bir PDF seç.",
          "Could not open PDF. Choose a valid PDF without a password.",
        ),
      );
    } finally {
      await doc?.loadingTask.destroy().catch(() => undefined);
      setBusy(false);
    }
  }
  async function restore() {
    if (!recovery) return;
    try {
      const project = await decodeProject(recovery);
      await load(
        new File([project.bytes as BlobPart], project.fileName, {
          type: "application/pdf",
        }),
        project.elements,
      );
    } catch {
      setError(
        t(
          "Taslak açılamadı. Yeni bir PDF seçebilirsin.",
          "Could not restore the draft. Choose a new PDF.",
        ),
      );
    }
  }
  function openAnother() {
    setConfirmOpen(false);
    setFile(null);
    setBytes(null);
    setPages([]);
    setElements([]);
    setSelectedId(null);
    setError("");
  }
  function addText() {
    if (!currentPage) return;
    const element = fitText(
      {
        id: crypto.randomUUID(),
        pageIndex,
        type: "text",
        text: t("Yeni yazı", "New text"),
        x: 0.12,
        y: 0.35,
        width: 0.65,
        height: 0.05,
        rotation: 0,
        opacity: 1,
        fontSize: 18,
        fontFamily: "Noto Sans",
        color: "#202020",
        bold: false,
        italic: false,
        align: "left",
        lineHeight: 1.25,
      },
      currentPage,
    );
    change([...elements, element]);
    setSelectedId(element.id);
  }
  function addCover() {
    const element: PdfCanvasElement = {
      id: crypto.randomUUID(),
      pageIndex,
      type: "shape",
      shape: "rectangle",
      name: "cover",
      x: 0.1,
      y: 0.12,
      width: 0.5,
      height: 0.07,
      rotation: 0,
      opacity: 1,
      fill: "#ffffff",
      stroke: "#ffffff",
      strokeWidth: 0,
    };
    change([...elements, element]);
    setSelectedId(element.id);
  }
  async function addImage(fileValue?: File) {
    if (!fileValue || !currentPage) return;
    if (
      fileValue.size > MAX_FILE_BYTES ||
      !["image/png", "image/jpeg"].includes(fileValue.type)
    ) {
      toast.error(
        t(
          "25 MB altında PNG veya JPG seç.",
          "Choose a PNG or JPG under 25 MB.",
        ),
      );
      return;
    }
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(fileValue);
      });
      const image = new Image();
      image.src = dataUrl;
      await image.decode();
      const width = Math.min(
        0.4,
        (((0.4 * image.naturalWidth) / image.naturalHeight) *
          currentPage.height) /
          currentPage.width,
      );
      const height =
        (width * currentPage.width) /
        (image.naturalWidth / image.naturalHeight) /
        currentPage.height;
      const element: PdfCanvasElement = {
        id: crypto.randomUUID(),
        pageIndex,
        type: "image",
        dataUrl,
        name: fileValue.name,
        x: 0.15,
        y: 0.25,
        width,
        height,
        rotation: 0,
        opacity: 1,
      };
      change([...elements, element]);
      setSelectedId(element.id);
    } catch {
      toast.error(t("Görsel açılamadı.", "Could not open the image."));
    }
  }
  function startDrag(
    event: ReactPointerEvent,
    element: PdfCanvasElement,
    resize = false,
  ) {
    if (busy || !pageRef.current || event.button !== 0) return;
    event.stopPropagation();
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedId(element.id);
    drag.current = {
      id: element.id,
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      rect: pageRef.current.getBoundingClientRect(),
      element,
      resize,
      before: elements,
    };
  }
  function moveDrag(event: ReactPointerEvent) {
    const active = drag.current;
    if (!active || active.pointer !== event.pointerId) return;
    const dx = (event.clientX - active.x) / active.rect.width,
      dy = (event.clientY - active.y) / active.rect.height;
    const element = active.element;
    let patchValue: Partial<PdfCanvasElement>;
    if (active.resize && element.type === "image") {
      const width = clamp(
        element.width + dx,
        0.04,
        Math.min(
          1 - element.x,
          ((1 - element.y) * element.width) / element.height,
        ),
      );
      patchValue = { width, height: (width * element.height) / element.width };
    } else
      patchValue = active.resize
        ? {
            width: clamp(element.width + dx, 0.04, 1 - element.x),
            height: clamp(element.height + dy, 0.02, 1 - element.y),
          }
        : {
            x: clamp(element.x + dx, 0, 1 - element.width),
            y: clamp(element.y + dy, 0, 1 - element.height),
          };
    setElements((values) =>
      values.map((value) => {
        if (value.id !== active.id) return value;
        const next = { ...value, ...patchValue } as PdfCanvasElement;
        return next.type === "text"
          ? fitText(next, pages[next.pageIndex])
          : next;
      }),
    );
  }
  function endDrag(event: ReactPointerEvent, cancelled = false) {
    const active = drag.current;
    if (!active || active.pointer !== event.pointerId) return;
    if (cancelled) setElements(active.before);
    else if (event.clientX !== active.x || event.clientY !== active.y) {
      setUndo((history) => [...history.slice(-49), active.before]);
      setRedo([]);
    }
    drag.current = null;
  }
  async function save() {
    if (!bytes || !file || busy || rendering || error) return;
    setBusy(true);
    setSelectedId(null);
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      const result = await Promise.race([
        exportSimplePdf(bytes, elements),
        new Promise<never>((_, reject) => {
          timeout = setTimeout(
            () => reject(new Error("EXPORT_TIMEOUT")),
            60_000,
          );
        }),
      ]);
      downloadBlob(
        new Blob([result as BlobPart], { type: "application/pdf" }),
        `${stem(file.name)}-edited.pdf`,
      );
      toast.success(
        t("PDF hazır, indirildi.", "Your PDF has been downloaded."),
      );
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "";
      toast.error(
        message === "TEXT_OVERFLOW"
          ? t(
              "Yazı sayfaya sığmıyor. Yazıyı kısalt, genişlet veya puntoyu küçült.",
              "Text does not fit. Shorten it, widen the box or reduce the font size.",
            )
          : message === "EXPORT_TIMEOUT"
            ? t(
                "PDF hazırlanması uzun sürdü. Tekrar dene.",
                "PDF export timed out. Please retry.",
              )
            : t(
                "PDF indirilemedi. Tekrar dene.",
                "Could not download the PDF. Please retry.",
              ),
      );
    } finally {
      if (timeout) clearTimeout(timeout);
      setBusy(false);
    }
  }

  const errorNotice = error ? (
    <p
      role="alert"
      className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
    >
      {error}
    </p>
  ) : null;
  if (!file)
    return (
      <div className="space-y-4">
        {errorNotice}
        {recovery && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border p-3">
            <p className="mr-auto text-sm">
              {t(
                "Yarım kalan düzenlemen var.",
                "You have a saved editing session.",
              )}
            </p>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void restore()}
            >
              {t("Devam et", "Continue")}
            </Button>
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => {
                setRecovery(null);
                void writeEditorDraft(null, DRAFT).catch(() => undefined);
              }}
            >
              {t("Taslağı sil", "Delete draft")}
            </Button>
          </div>
        )}
        <FileDrop
          disabled={busy}
          accept="application/pdf,.pdf"
          onFiles={(files) => {
            if (files[0]) void load(files[0]);
          }}
        />
        {busy && <p role="status">{t("PDF açılıyor…", "Opening PDF…")}</p>}
        <p className="text-sm text-muted-foreground">
          {t(
            "PDF’ye yazı veya görsel ekle. Taşımak için sürükle, boyutunu değiştirmek için köşesinden çek.",
            "Add text or an image to your PDF. Drag to move it, or drag its corner to resize.",
          )}
        </p>
      </div>
    );

  return (
    <div
      className="simple-pdf-editor overflow-hidden rounded-2xl border bg-card"
      aria-busy={busy}
    >
      <div className="flex flex-wrap items-center gap-2 border-b p-3">
        <p className="min-w-0 flex-1 truncate text-sm font-medium">
          {file.name}
        </p>
        <Button
          variant="ghost"
          disabled={busy}
          onClick={() =>
            elements.length ? setConfirmOpen(true) : openAnother()
          }
        >
          {t("Başka PDF", "Open another")}
        </Button>
        <Button
          disabled={busy || rendering || Boolean(error)}
          onClick={() => void save()}
        >
          <Download className="size-4" />
          {busy
            ? t("Hazırlanıyor…", "Preparing…")
            : t("PDF indir", "Download PDF")}
        </Button>
      </div>
      {confirmOpen && (
        <div
          role="dialog"
          aria-label={t("Başka PDF aç", "Open another PDF")}
          className="space-y-3 border-b p-3"
        >
          <p className="text-sm">
            {t(
              "Önce PDF’ni indirebilirsin. Başka dosya açmak istiyor musun?",
              "You can download your PDF first. Open another file?",
            )}
          </p>
          <Button variant="outline" onClick={() => setConfirmOpen(false)}>
            {t("Vazgeç", "Cancel")}
          </Button>{" "}
          <Button onClick={openAnother}>
            {t("Başka dosya seç", "Choose another file")}
          </Button>
        </div>
      )}
      {errorNotice}
      <div
        className="flex flex-wrap items-center gap-2 border-b p-3"
        inert={busy}
      >
        <Button variant="outline" onClick={addText}>
          <Type className="size-4" />
          {t("Yazı ekle", "Add text")}
        </Button>
        <Button variant="outline" onClick={() => imageInput.current?.click()}>
          <ImagePlus className="size-4" />
          {t("Görsel ekle", "Add image")}
        </Button>
        <Button variant="outline" onClick={addCover}>
          <Square className="size-4" />
          {t("Alanı kapat", "Cover area")}
        </Button>
        <div className="ml-auto flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            aria-label={t("Geri al", "Undo")}
            disabled={!undo.length}
            onClick={() => {
              setRedo((history) => [...history, elements]);
              setElements(undo[undo.length - 1]);
              setUndo(undo.slice(0, -1));
              setSelectedId(null);
            }}
          >
            <Undo2 className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label={t("İleri al", "Redo")}
            disabled={!redo.length}
            onClick={() => {
              setUndo((history) => [...history, elements]);
              setElements(redo[redo.length - 1]);
              setRedo(redo.slice(0, -1));
              setSelectedId(null);
            }}
          >
            <Redo2 className="size-4" />
          </Button>
        </div>
        <input
          aria-label={t("Görsel dosyası", "Image file")}
          ref={imageInput}
          className="sr-only"
          type="file"
          accept="image/png,image/jpeg"
          onChange={(event) => {
            void addImage(event.target.files?.[0]);
            event.currentTarget.value = "";
          }}
        />
      </div>
      <div
        className="min-h-[160px] border-b bg-muted/40 p-3 sm:min-h-[96px]"
        inert={busy}
      >
        {selected ? (
          <div className="flex flex-wrap items-end gap-2">
            {selected.type === "text" ? (
              <>
                <label className="w-full text-xs sm:min-w-[180px] sm:flex-1">
                  {t("Yazı", "Text")}
                  <textarea
                    aria-label={t("Yazı", "Text")}
                    className="mt-1 block h-12 min-h-12 w-full rounded-lg border bg-background p-2 text-base"
                    value={selected.text}
                    onChange={(event) =>
                      patch({
                        text: event.target.value,
                      } as Partial<CanvasTextElement>)
                    }
                  />
                </label>
                <label className="text-xs">
                  {t("Punto", "Font size")}
                  <input
                    aria-label={t("Punto", "Font size")}
                    className="mt-1 block h-11 w-16 rounded-lg border bg-background px-2 text-base"
                    type="number"
                    min={6}
                    max={96}
                    value={selected.fontSize}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      if (value >= 6 && value <= 96)
                        patch({
                          fontSize: value,
                        } as Partial<CanvasTextElement>);
                    }}
                  />
                </label>
                <Button
                  variant={selected.bold ? "default" : "outline"}
                  aria-pressed={selected.bold}
                  onClick={() =>
                    patch({
                      bold: !selected.bold,
                    } as Partial<CanvasTextElement>)
                  }
                >
                  {t("Kalın", "Bold")}
                </Button>
              </>
            ) : (
              <p className="mr-auto text-sm">
                {selected.type === "image"
                  ? t(
                      "Görseli sürükle veya köşesinden boyutlandır.",
                      "Drag the image or resize from its corner.",
                    )
                  : t(
                      "Kutuyu kapatacağın alanın üzerine sürükle.",
                      "Drag the box onto the area you want to cover.",
                    )}
              </p>
            )}
            {selected.type !== "image" && (
              <label className="text-xs">
                {t("Renk", "Color")}
                <input
                  aria-label={t("Renk", "Color")}
                  type="color"
                  className="mt-1 block h-11 w-12 rounded-lg border"
                  value={
                    selected.type === "text" ? selected.color : selected.fill
                  }
                  onChange={(event) =>
                    patch(
                      selected.type === "text"
                        ? ({
                            color: event.target.value,
                          } as Partial<CanvasTextElement>)
                        : ({
                            fill: event.target.value,
                            stroke: event.target.value,
                          } as Partial<PdfCanvasElement>),
                    )
                  }
                />
              </label>
            )}
            <Button
              size="icon"
              variant="ghost"
              aria-label={t("Sil", "Delete")}
              onClick={() => {
                change(
                  elements.filter((element) => element.id !== selected.id),
                );
                setSelectedId(null);
              }}
            >
              <Trash2 className="size-4" />
            </Button>
            <Button variant="ghost" onClick={() => setSelectedId(null)}>
              {t("Tamam", "Done")}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t(
              "Bir araç seçip ekle. Eklediğin öğeye dokunarak düzenle.",
              "Choose a tool to add an item. Tap an added item to edit it.",
            )}
          </p>
        )}
      </div>
      {elements.some((element) => element.type === "shape") && (
        <p className="border-b px-3 py-2 text-xs text-muted-foreground">
          {t(
            "Alan kapatılan sayfalar görüntü olarak kaydedilir; o sayfalarda yazı seçilemez ve form alanları çalışmaz.",
            "Covered pages are saved as images; text selection and form fields are unavailable on those pages.",
          )}
        </p>
      )}
      {draftFailed && (
        <p role="status" className="px-3 py-2 text-sm">
          {t(
            "Otomatik kayıt yapılamadı. PDF’ni indirerek kaydet.",
            "Autosave is unavailable. Download your PDF to save it.",
          )}
        </p>
      )}
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            aria-label={t("Önceki sayfa", "Previous page")}
            disabled={busy || pageIndex === 0}
            onClick={() => {
              setPageIndex(pageIndex - 1);
              setSelectedId(null);
            }}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm tabular-nums">
            {pageIndex + 1} / {pages.length}
          </span>
          <Button
            size="icon"
            variant="ghost"
            aria-label={t("Sonraki sayfa", "Next page")}
            disabled={busy || pageIndex === pages.length - 1}
            onClick={() => {
              setPageIndex(pageIndex + 1);
              setSelectedId(null);
            }}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            aria-label={t("Uzaklaştır", "Zoom out")}
            disabled={busy || zoom <= 0.5}
            onClick={() => setZoom((value) => Math.max(0.5, value - 0.25))}
          >
            <Minus className="size-4" />
          </Button>
          <Button variant="ghost" disabled={busy} onClick={() => setZoom(1)}>
            {Math.round(zoom * 100)}%
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label={t("Yakınlaştır", "Zoom in")}
            disabled={busy || zoom >= 2}
            onClick={() => setZoom((value) => Math.min(2, value + 0.25))}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
      <div
        ref={viewerRef}
        className="relative max-h-[70dvh] overflow-auto bg-neutral-100 p-3 dark:bg-neutral-900"
        aria-label={t("PDF önizleme", "PDF preview")}
      >
        {rendering && (
          <p
            role="status"
            className="sticky top-0 z-20 mx-auto w-fit rounded-lg bg-background px-3 py-2 text-sm"
          >
            {t("Sayfa yükleniyor…", "Loading page…")}
          </p>
        )}
        {currentPage && (
          <div
            ref={pageRef}
            className="relative mx-auto bg-white shadow-md"
            style={{
              width: currentPage.width * scale,
              height: currentPage.height * scale,
            }}
            onPointerDown={() => setSelectedId(null)}
          >
            <div
              ref={canvasHost}
              className="pointer-events-none absolute inset-0"
            />
            {elements
              .filter((element) => element.pageIndex === pageIndex)
              .map((element) => (
                <div
                  key={element.id}
                  role="button"
                  tabIndex={busy ? -1 : 0}
                  aria-label={
                    element.type === "text"
                      ? element.text || t("Boş yazı", "Empty text")
                      : element.type === "image"
                        ? element.name
                        : t("Kapatma kutusu", "Cover box")
                  }
                  aria-pressed={selectedId === element.id}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedId(element.id);
                    }
                    if (
                      [
                        "ArrowLeft",
                        "ArrowRight",
                        "ArrowUp",
                        "ArrowDown",
                      ].includes(event.key)
                    ) {
                      event.preventDefault();
                      const x = clamp(
                        element.x +
                          (event.key === "ArrowRight"
                            ? 0.01
                            : event.key === "ArrowLeft"
                              ? -0.01
                              : 0),
                        0,
                        1 - element.width,
                      );
                      const y = clamp(
                        element.y +
                          (event.key === "ArrowDown"
                            ? 0.01
                            : event.key === "ArrowUp"
                              ? -0.01
                              : 0),
                        0,
                        1 - element.height,
                      );
                      change(
                        elements.map((value) =>
                          value.id === element.id ? { ...value, x, y } : value,
                        ),
                      );
                    }
                    if (event.key === "Delete" || event.key === "Backspace") {
                      event.preventDefault();
                      change(
                        elements.filter((value) => value.id !== element.id),
                      );
                      setSelectedId(null);
                    }
                  }}
                  onPointerDown={(event) => startDrag(event, element)}
                  onPointerMove={moveDrag}
                  onPointerUp={(event) => endDrag(event)}
                  onPointerCancel={(event) => endDrag(event, true)}
                  className="absolute cursor-move touch-none outline-none"
                  style={{
                    left: `${element.x * 100}%`,
                    top: `${element.y * 100}%`,
                    width: `${element.width * 100}%`,
                    height: `${element.height * 100}%`,
                    outline:
                      selectedId === element.id
                        ? "2px solid #2563eb"
                        : undefined,
                  }}
                >
                  {element.type === "text" ? (
                    <div
                      className="pointer-events-none size-full overflow-hidden whitespace-pre-wrap break-words"
                      style={{
                        fontFamily: "Noto Sans",
                        fontSize: element.fontSize * scale,
                        fontWeight: element.bold ? 700 : 400,
                        lineHeight: 1.25,
                        color: element.color,
                      }}
                    >
                      {element.text}
                    </div>
                  ) : element.type ===
                    "image" /* eslint-disable-next-line @next/next/no-img-element */ ? (
                    <img
                      draggable={false}
                      src={element.dataUrl}
                      alt=""
                      className="pointer-events-none size-full"
                    />
                  ) : (
                    <div
                      className="pointer-events-none size-full"
                      style={{ background: element.fill }}
                    />
                  )}
                  {selectedId === element.id && (
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={t("Boyutlandır", "Resize")}
                      onKeyDown={(event) => {
                        if (
                          ![
                            "ArrowLeft",
                            "ArrowRight",
                            "ArrowUp",
                            "ArrowDown",
                          ].includes(event.key)
                        )
                          return;
                        event.preventDefault();
                        event.stopPropagation();
                        const width = clamp(
                          element.width +
                            (event.key === "ArrowRight"
                              ? 0.01
                              : event.key === "ArrowLeft"
                                ? -0.01
                                : 0),
                          0.04,
                          1 - element.x,
                        );
                        const height = clamp(
                          element.height +
                            (event.key === "ArrowDown"
                              ? 0.01
                              : event.key === "ArrowUp"
                                ? -0.01
                                : 0),
                          0.02,
                          1 - element.y,
                        );
                        if (element.type === "image") {
                          const ratio = element.height / element.width;
                          const requestedWidth =
                            event.key === "ArrowUp" || event.key === "ArrowDown"
                              ? height / ratio
                              : width;
                          const imageWidth = clamp(
                            requestedWidth,
                            0.04,
                            Math.min(1 - element.x, (1 - element.y) / ratio),
                          );
                          patch({
                            width: imageWidth,
                            height: imageWidth * ratio,
                          });
                        } else {
                          patch({ width, height });
                        }
                      }}
                      onPointerDown={(event) => startDrag(event, element, true)}
                      onPointerMove={moveDrag}
                      onPointerUp={(event) => endDrag(event)}
                      onPointerCancel={(event) => endDrag(event, true)}
                      className="absolute -bottom-3 -right-3 flex size-8 cursor-nwse-resize touch-none items-center justify-center rounded-full bg-blue-600 text-white shadow"
                    >
                      <span aria-hidden="true">↘</span>
                    </span>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
