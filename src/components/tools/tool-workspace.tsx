"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FileList, formatBytes } from "@/components/tools/file-list";
import { PagePicker } from "@/components/tools/page-picker";
const EditPdfEditor = dynamic(() => import("@/components/tools/edit-pdf-editor").then(m => m.EditPdfEditor));
import { FileDrop } from "@/components/tools/file-drop";
import { PdfPlacementPreview } from "@/components/tools/pdf-placement-preview";
import { PdfRotatePreview } from "@/components/tools/pdf-rotate-preview";
import { ToolShell } from "@/components/tools/tool-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { downloadBlob as saveBlob, stem } from "@/lib/download";
import { copy } from "@/lib/i18n";
import { useDisplayLanguage, useLabels } from "@/components/providers";
import {
  compressPdf,
  imagesToPdf,
  mergePdfs,
  numberPdfPages,
  ocrPdf,
  pdfToJpegs,
  rotatePdf,
  signPdf,
  splitPdf,
  watermarkPdf,
  type CompressQuality,
  type PdfPlacement,
} from "@/lib/pdf/ops";
import { openPdf } from "@/lib/pdf/pdfjs-client";
import { MAX_FILE_BYTES, isToolSlug, type ToolSlug } from "@/lib/tools";

function copyFor(slug: ToolSlug, labels: (typeof copy)[keyof typeof copy]) {
  const map = {
    "edit-pdf": [labels.toolEditPdf, labels.toolEditPdfHint],
    "word-to-pdf": [labels.toolWordPdf, labels.toolWordPdfHint],
    "pdf-to-word": [labels.toolPdfWord, labels.toolPdfWordHint],
    merge: [labels.toolMerge, labels.toolMergeHint],
    split: [labels.toolSplit, labels.toolSplitHint],
    compress: [labels.toolCompress, labels.toolCompressHint],
    "jpg-pdf": [labels.toolJpgPdf, labels.toolJpgPdfHint],
    ocr: [labels.toolOcr, labels.toolOcrHint],
    sign: [labels.toolSign, labels.toolSignHint],
    watermark: [labels.toolWatermark, labels.toolWatermarkHint],
    rotate: [labels.toolRotate, labels.toolRotateHint],
    "page-numbers": [labels.toolPageNumbers, labels.toolPageNumbersHint],
  } as const;
  return map[slug];
}

function actionCopy(
  slug: Exclude<ToolSlug, "edit-pdf">,
  labels: (typeof copy)[keyof typeof copy],
  jpgMode: "to-pdf" | "to-jpg",
) {
  const map = {
    "word-to-pdf": labels.runWordPdf,
    "pdf-to-word": labels.runPdfWord,
    merge: labels.runMerge,
    split: labels.runSplit,
    compress: labels.runCompress,
    "jpg-pdf": jpgMode === "to-pdf" ? labels.runImagesPdf : labels.runPdfImages,
    ocr: labels.runOcr,
    sign: labels.runSign,
    watermark: labels.runWatermark,
    rotate: labels.runRotate,
    "page-numbers": labels.runPageNumbers,
  } as const;
  return map[slug];
}

export function ToolWorkspace({ slug }: { slug: string }) {
  const labels = useLabels();
  if (!isToolSlug(slug)) {
    return (
      <ToolShell title={labels.unknownTool} hint="">
        <p className="text-sm text-muted-foreground">{labels.unknownTool}</p>
      </ToolShell>
    );
  }
  const [title, hint] = copyFor(slug, labels);
  return (
    <ToolShell
      title={title}
      hint={hint}
      wide={
        slug === "edit-pdf" ||
        slug === "sign" ||
        slug === "watermark" ||
        slug === "rotate" ||
        slug === "page-numbers"
      }
    >
      {slug === "edit-pdf" ? <EditPdfEditor /> : <GenericTool key={slug} slug={slug} />}
    </ToolShell>
  );
}

function GenericTool({ slug }: { slug: Exclude<ToolSlug, "edit-pdf"> }) {
  const labels = useLabels();
  const tr = useDisplayLanguage() === "TR";
  const [results, setResults] = useState<{ blob: Blob; name: string }[]>([]);
  const [error, setError] = useState("");
  const [validating, setValidating] = useState(false);
  const [rotateSelection, setRotateSelection] = useState(false);
  const [splitMode, setSplitMode] = useState("range");
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [fromPage, setFromPage] = useState(1);
  const [toPage, setToPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [jpgMode, setJpgMode] = useState<"to-pdf" | "to-jpg">("to-pdf");
  const [watermark, setWatermark] = useState("TASLAK");
  const [signature, setSignature] = useState("");
  const [signatureImage, setSignatureImage] = useState<File | undefined>();
  const [angle, setAngle] = useState<90 | 180 | 270>(90);
  const [compressQuality, setCompressQuality] = useState<CompressQuality>("balanced");
  const [progress, setProgress] = useState("");
  const [placement, setPlacement] = useState<PdfPlacement>(() => {
    if (slug === "sign") return { x: 0.78, y: 0.88 };
    if (slug === "page-numbers") return { x: 0.5, y: 0.965 };
    return { x: 0.5, y: 0.5 };
  });

  const accept = useMemo(() => {
    if (slug === "word-to-pdf") return ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (slug === "jpg-pdf" && jpgMode === "to-pdf") return "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";
    return "application/pdf,.pdf";
  }, [slug, jpgMode]);

  const multiple =
    slug === "merge" ||
    slug === "compress" ||
    slug === "word-to-pdf" ||
    slug === "watermark" ||
    slug === "rotate" ||
    slug === "page-numbers" ||
    (slug === "jpg-pdf" && jpgMode === "to-pdf");

  function downloadBlob(blob: Blob, name: string) { setResults(current => [...current, { blob, name }]); }

  async function onFiles(next: File[]) {
    setResults([]); setError(""); setSelectedPages([]);
    setFiles(multiple ? (prev) => [...prev, ...next] : [next[0]]);
    if ((slug === "split" || slug === "pdf-to-word" || slug === "ocr") && next[0]) {
      setValidating(true);
      try {
        const doc = await openPdf(await next[0].arrayBuffer());
        setPageCount(doc.numPages);
        setFromPage(1);
        setToPage(doc.numPages);
        await doc.loadingTask.destroy();
      } catch {
        setError(tr ? "Bu PDF okunamadı. Dosya bozuk veya parola korumalı olabilir." : "This PDF could not be read. It may be damaged or password protected.");
      } finally { setValidating(false); }
    }
  }

  async function processOne(file: File) {
    if (slug === "word-to-pdf") {
      const { docxToPdf } = await import("@/lib/pdf/word");
      const bytes = await docxToPdf(file);
      downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), `${stem(file.name)}.pdf`);
    } else if (slug === "pdf-to-word") {
      const { pdfToDocx } = await import("@/lib/pdf/word");
      const blob = await pdfToDocx(file);
      downloadBlob(blob, `${stem(file.name)}.docx`);
    } else if (slug === "split") {
      if (splitMode === "every") {
        for (let page = 1; page <= pageCount; page++) {
          const bytes = await splitPdf(file, page, page);
          downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), `${stem(file.name)}-${page}.pdf`);
        }
        return;
      }
      const bytes = splitMode === "selected" ? await (await import("@/lib/pdf/ops")).extractPdfPages(file, selectedPages) : await splitPdf(file, fromPage, toPage);
      downloadBlob(
        new Blob([bytes as BlobPart], { type: "application/pdf" }),
        `${stem(file.name)}-p${fromPage}-${toPage}.pdf`,
      );
    } else if (slug === "compress") {
      const bytes = await compressPdf(file, compressQuality);
      downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), `${stem(file.name)}-small.pdf`);
    } else if (slug === "ocr") {
      const bytes = await ocrPdf(file, (page, total) => {
        setProgress(labels.ocrProgress.replace("{page}", String(page)).replace("{total}", String(total)));
      });
      downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), `${stem(file.name)}-ocr.pdf`);
    } else if (slug === "sign") {
      const bytes = await signPdf(file, signature, signatureImage, placement);
      downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), `${stem(file.name)}-signed.pdf`);
    } else if (slug === "watermark") {
      const bytes = await watermarkPdf(file, watermark, placement);
      downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), `${stem(file.name)}-mark.pdf`);
    } else if (slug === "rotate") {
      const bytes = await rotatePdf(file, angle, rotateSelection && files.length === 1 ? selectedPages : undefined);
      downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), `${stem(file.name)}-rot.pdf`);
    } else if (slug === "page-numbers") {
      const bytes = await numberPdfPages(file, placement);
      downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), `${stem(file.name)}-n.pdf`);
    }
  }

  async function run() {
    if (!files.length) return;
    setBusy(true);
    setResults([]); setError("");
    setProgress("");
    try {
      if (slug === "merge") {
        const bytes = await mergePdfs(files);
        downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), "merged.pdf");
      } else if (slug === "jpg-pdf" && jpgMode === "to-pdf") {
        const bytes = await imagesToPdf(files);
        downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), "images.pdf");
      } else if (slug === "jpg-pdf") {
        const pages = await pdfToJpegs(files[0]);
        for (const page of pages) downloadBlob(page.blob, page.name);
      } else {
        for (const file of files) await processOne(file);
      }
      toast.success(labels.toolDone);
    } catch (error) {
      console.error("PDF processing failed", error);
      const message = tr ? "İşlem tamamlanamadı. Dosya bozuk veya parola korumalı olabilir. Ayarları kontrol edip yeniden deneyin ya da başka bir dosya seçin." : "Processing failed. The file may be damaged or password protected. Check your settings and retry, or choose another file.";
      setError(message); toast.error(message);
    } finally {
      setBusy(false);
      setProgress("");
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <fieldset disabled={busy || validating} className="min-w-0 space-y-5">
      {slug === "jpg-pdf" ? (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={jpgMode === "to-pdf" ? "default" : "outline"}
            onClick={() => {
              setJpgMode("to-pdf");
              setFiles([]);
            }}
          >
            {labels.jpgToPdf}
          </Button>
          <Button
            size="sm"
            variant={jpgMode === "to-jpg" ? "default" : "outline"}
            onClick={() => {
              setJpgMode("to-jpg");
              setFiles([]);
            }}
          >
            {labels.pdfToJpg}
          </Button>
        </div>
      ) : null}
      <FileDrop disabled={busy || validating} accept={accept} multiple={multiple} onFiles={(next) => void onFiles(next)}>
        <p className="mt-2 text-xs text-muted-foreground">
          {slug === "word-to-pdf"
            ? labels.pickDocx
            : slug === "jpg-pdf" && jpgMode === "to-pdf"
              ? labels.pickImages
              : labels.pickPdf}
        </p>
      </FileDrop>
      {files.length > 0 && <FileList files={files} disabled={busy || validating} onChange={(next) => { setFiles(next); setResults([]); setError(""); }} />}
      {slug === "ocr" && <p className="rounded-lg bg-muted p-3 text-sm">{tr ? "Türkçe + İngilizce OCR. En fazla ilk 20 sayfa işlenir; çıktı aranabilir PDF’dir." : "Turkish + English OCR. Only the first 20 pages are processed; output is a searchable PDF."}{files.length > 0 && ` (${pageCount} ${tr ? "sayfa" : "pages"})`}</p>}
      {slug === "sign" && <p className="rounded-lg bg-muted p-3 text-sm">{tr ? "Bu araç belge üzerine görsel imza ekler; nitelikli elektronik imza değildir. İmza son sayfaya eklenir." : "This tool adds a visual signature, not a qualified electronic signature. The signature is added to the last page."}</p>}
      {slug === "compress" && <p className="text-sm text-muted-foreground">{tr ? "Sıkıştırma sayfaları görüntüye dönüştürür; seçilebilir metin korunmaz. Dosya boyutu içeriğe göre artabilir." : "Compression rasterizes pages; selectable text is not retained. File size may increase depending on the content."}</p>}
      {slug === "split" && files.length > 0 && <div className="space-y-3"><label className="grid gap-2 text-sm font-semibold">{tr ? "Ayırma yöntemi" : "Split method"}<select className="h-11 rounded-lg border bg-background px-3" value={splitMode} onChange={e => setSplitMode(e.target.value)}><option value="range">{tr ? "Sayfa aralığı" : "Page range"}</option><option value="every">{tr ? "Her sayfayı ayrı indir" : "Download every page separately"}</option><option value="selected">{tr ? "Sayfaları görsel olarak seç" : "Select pages visually"}</option></select></label>{splitMode === "selected" && <PagePicker key={files[0].name + files[0].lastModified} file={files[0]} selected={selectedPages} onChange={setSelectedPages} />}</div>}
      {slug === "split" && splitMode === "range" && files.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="split-from">{labels.splitFrom}</Label>
            <Input
              type="number"
              id="split-from"
              min={1}
              max={pageCount}
              value={fromPage}
              onChange={(event) => setFromPage(Number(event.target.value) || 1)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="split-to">{labels.splitTo}</Label>
            <Input
              type="number"
              id="split-to"
              min={1}
              max={pageCount}
              value={toPage}
              onChange={(event) => setToPage(Number(event.target.value) || 1)}
            />
          </div>
        </div>
      ) : null}
      {slug === "compress" && <fieldset className="space-y-3"><legend className="text-base font-semibold">{labels.compressQuality}</legend><div className="grid gap-3 sm:grid-cols-3">{(["balanced", "strong", "keep"] as const).map((quality, i) => <label key={quality} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${compressQuality === quality ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "bg-background"}`}><input type="radio" name="compression-quality" className="mt-1 accent-primary" value={quality} checked={compressQuality === quality} onChange={() => setCompressQuality(quality)} /><span><span className="block font-semibold">{(tr ? ["Dengeli · Önerilen", "Daha küçük dosya", "Yüksek kalite"] : ["Balanced · Recommended", "Smaller file", "High quality"])[i]}</span><span className="mt-1 block text-sm text-muted-foreground">{(tr ? ["Boyut ve görüntü kalitesi dengesi.", "Daha düşük görüntü kalitesi.", "Daha fazla görüntü ayrıntısı."] : ["Balance size and image quality.", "Lower image quality.", "Retain more image detail."])[i]}</span></span></label>)}</div></fieldset>}
      {slug === "watermark" ? (
        <div className="grid gap-2">
          <Label htmlFor="watermark">{labels.watermarkLabel}</Label>
          <Input id="watermark" value={watermark} onChange={(event) => setWatermark(event.target.value)} />
        </div>
      ) : null}
      {slug === "rotate" ? (
        <div className="grid gap-2">
          <Label htmlFor="rotate-angle">{labels.rotateAngle}</Label>
          <select
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            id="rotate-angle"
            value={angle}
            onChange={(event) => setAngle(Number(event.target.value) as 90 | 180 | 270)}
          >
            <option value={90}>{tr ? "90° sağa" : "90° right"}</option>
            <option value={180}>180°</option>
            <option value={270}>{tr ? "90° sola" : "90° left"}</option>
          </select>
        </div>
      ) : null}
      {files.length === 1 && slug === "rotate" && <div className="space-y-3"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={rotateSelection} onChange={e => setRotateSelection(e.target.checked)} />{tr ? "Yalnızca seçtiğim sayfaları döndür" : "Rotate selected pages only"}</label>{rotateSelection && <PagePicker key={files[0].name + files[0].lastModified} file={files[0]} selected={selectedPages} onChange={setSelectedPages} />}</div>}
      {files[0] && slug === "rotate" ? (
        <PdfRotatePreview
          key={`${files[0].name}-${files[0].size}-${files[0].lastModified}`}
          file={files[0]}
          angle={angle}
        />
      ) : null}
      {slug === "sign" ? (
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="signature">{labels.signatureLabel}</Label>
            <Input id="signature" value={signature} onChange={(event) => setSignature(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="signature-image">{labels.signatureImage}</Label>
            <Input
              id="signature-image"
              type="file"
              accept="image/png,image/jpeg,.png,.jpg,.jpeg"
              onChange={(event) => {
                const image = event.target.files?.[0];
                if (image && (image.size > MAX_FILE_BYTES || !["image/png", "image/jpeg"].includes(image.type))) {
                  setError(tr ? "En fazla 25 MB boyutunda bir PNG veya JPG seçin." : "Choose a PNG or JPG up to 25 MB.");
                  event.target.value = "";
                  return;
                }
                setError(""); setSignatureImage(image);
              }}
            />
          </div>
        </div>
      ) : null}
      {files[0] && (slug === "sign" || slug === "watermark" || slug === "page-numbers") ? (
        <PdfPlacementPreview
          file={files[0]}
          kind={slug === "page-numbers" ? "page-number" : slug === "sign" ? "signature" : "watermark"}
          placement={placement}
          onPlacementChange={setPlacement}
          text={slug === "sign" ? signature : slug === "watermark" ? watermark : ""}
          signatureImage={slug === "sign" ? signatureImage : undefined}
        />
      ) : null}
      {slug === "page-numbers" && <label className="grid gap-2 text-sm font-semibold">{tr ? "Konum" : "Position"}<select className="h-11 rounded-lg border bg-background px-3" value={`${placement.x},${placement.y}`} onChange={e => { const [x, y] = e.target.value.split(",").map(Number); setPlacement({ x, y }); }}><option value={`${placement.x},${placement.y}`}>{tr ? "Önizlemedeki konum" : "Preview position"}</option>{[0.05, 0.965].flatMap((y, row) => [0.12, 0.5, 0.88].map((x, col) => <option key={`${x},${y}`} value={`${x},${y}`}>{(tr ? ["Üst", "Alt"] : ["Top", "Bottom"])[row]} · {(tr ? ["Sol", "Orta", "Sağ"] : ["Left", "Center", "Right"])[col]}</option>))}</select></label>}
      </fieldset>
      <div className="mt-6 space-y-4 border-t pt-5">
      {(busy || validating) && <p role="status" className="rounded-lg bg-primary/10 p-3 text-sm font-medium text-primary">{validating ? (tr ? "Dosya doğrulanıyor…" : "Validating file…") : progress || labels.processing}</p>}
      {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
      <Button
        className="min-h-12 w-full text-base"
        onClick={() => void run()}
        disabled={
          !files.length ||
          busy || validating ||
          (slug === "split" && (splitMode === "selected" ? !selectedPages.length : splitMode === "range" && (fromPage < 1 || toPage > pageCount || fromPage > toPage))) ||
          (slug === "rotate" && files.length === 1 && rotateSelection && !selectedPages.length) ||
          (slug === "sign" && !signature.trim() && !signatureImage) ||
          (slug === "watermark" && !watermark.trim())
        }
      >
        {busy ? labels.processing : actionCopy(slug, labels, jpgMode)}
      </Button>
      </div>
      {results.length > 0 && <section aria-label={tr ? "İşlem sonuçları" : "Results"} className="mt-6 rounded-xl border border-primary/25 bg-primary/5 p-4"><h2 role="status" className="text-xl font-semibold">{error ? (tr ? "Tamamlanan dosyalar" : "Completed files") : labels.toolDone}</h2><ul className="mt-4 space-y-3">{results.map((result, i) => <li key={i} className="flex flex-wrap items-center justify-between gap-3"><div className="min-w-0"><p className="break-all font-medium">{result.name}</p><p className="text-sm text-muted-foreground">{formatBytes(result.blob.size)}{slug === "compress" && files[i] ? ` · ${Math.abs((1 - result.blob.size / files[i].size) * 100).toFixed(1)}% ${result.blob.size < files[i].size ? (tr ? "daha küçük" : "smaller") : (tr ? "daha büyük" : "larger")}` : ""}</p></div><Button onClick={() => saveBlob(result.blob, result.name)}>{tr ? "İndir" : "Download"}</Button></li>)}</ul><Button className="mt-4" variant="outline" onClick={() => { setFiles([]); setResults([]); setError(""); }}>{tr ? "Başka dosya işle" : "Process another file"}</Button><div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">{["merge", "compress", "pdf-to-word"].filter(item => item !== slug).map(item => <Link key={item} className="underline underline-offset-4" href={`/tools/${item}`}>{copyFor(item as ToolSlug, labels)[0]} →</Link>)}</div></section>}
    </div>
  );
}
