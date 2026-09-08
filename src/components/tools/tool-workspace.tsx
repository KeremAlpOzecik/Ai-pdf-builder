"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EditPdfEditor } from "@/components/tools/edit-pdf-editor";
import { FileDrop } from "@/components/tools/file-drop";
import { PdfPlacementPreview } from "@/components/tools/pdf-placement-preview";
import { PdfRotatePreview } from "@/components/tools/pdf-rotate-preview";
import { ToolShell } from "@/components/tools/tool-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { downloadBlob, stem } from "@/lib/download";
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
import { docxToPdf, pdfToDocx } from "@/lib/pdf/word";
import { openPdf } from "@/lib/pdf/pdfjs-client";
import { getToolSeo } from "@/lib/tool-seo";
import { isToolSlug, type ToolSlug } from "@/lib/tools";

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
  const lang = useDisplayLanguage();
  if (!isToolSlug(slug)) {
    return (
      <ToolShell title={labels.unknownTool} hint="">
        <p className="text-sm text-muted-foreground">{labels.unknownTool}</p>
      </ToolShell>
    );
  }
  const seo = getToolSeo(slug);
  const [title, hint] = copyFor(slug, labels);
  return (
    <ToolShell
      title={lang === "TR" && seo ? seo.h1 : title}
      hint={seo && lang === "TR" ? seo.summary : hint}
      wide={
        slug === "edit-pdf" ||
        slug === "sign" ||
        slug === "watermark" ||
        slug === "rotate" ||
        slug === "page-numbers"
      }
    >
      {slug === "edit-pdf" ? <EditPdfEditor /> : <GenericTool slug={slug} />}
    </ToolShell>
  );
}

function GenericTool({ slug }: { slug: Exclude<ToolSlug, "edit-pdf"> }) {
  const labels = useLabels();
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

  async function onFiles(next: File[]) {
    setFiles(multiple ? (prev) => [...prev, ...next] : [next[0]]);
    if ((slug === "split" || slug === "pdf-to-word") && next[0]) {
      try {
        const doc = await openPdf(await next[0].arrayBuffer());
        setPageCount(doc.numPages);
        setFromPage(1);
        setToPage(doc.numPages);
      } catch {
        /* ignore until convert */
      }
    }
  }

  async function processOne(file: File) {
    if (slug === "word-to-pdf") {
      const bytes = await docxToPdf(file);
      downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), `${stem(file.name)}.pdf`);
    } else if (slug === "pdf-to-word") {
      const blob = await pdfToDocx(file);
      downloadBlob(blob, `${stem(file.name)}.docx`);
    } else if (slug === "split") {
      const bytes = await splitPdf(file, fromPage, toPage);
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
      const bytes = await rotatePdf(file, angle);
      downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), `${stem(file.name)}-rot.pdf`);
    } else if (slug === "page-numbers") {
      const bytes = await numberPdfPages(file, placement);
      downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), `${stem(file.name)}-n.pdf`);
    }
  }

  async function run() {
    if (!files.length) return;
    setBusy(true);
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
      toast.error(error instanceof Error ? error.message : labels.toolFailed);
    } finally {
      setBusy(false);
      setProgress("");
    }
  }

  return (
    <div className="space-y-5">
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
      <FileDrop accept={accept} multiple={multiple} onFiles={(next) => void onFiles(next)}>
        <p className="mt-2 text-xs text-muted-foreground">
          {slug === "word-to-pdf"
            ? labels.pickDocx
            : slug === "jpg-pdf" && jpgMode === "to-pdf"
              ? labels.pickImages
              : labels.pickPdf}
        </p>
      </FileDrop>
      {files.length ? (
        <ul className="space-y-1 text-sm">
          {files.map((file, index) => (
            <li key={`${file.name}-${file.size}-${index}`}>{file.name}</li>
          ))}
        </ul>
      ) : null}
      {slug === "split" && files.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>{labels.splitFrom}</Label>
            <Input
              type="number"
              min={1}
              max={pageCount}
              value={fromPage}
              onChange={(event) => setFromPage(Number(event.target.value) || 1)}
            />
          </div>
          <div className="grid gap-2">
            <Label>{labels.splitTo}</Label>
            <Input
              type="number"
              min={1}
              max={pageCount}
              value={toPage}
              onChange={(event) => setToPage(Number(event.target.value) || 1)}
            />
          </div>
        </div>
      ) : null}
      {slug === "compress" ? (
        <div className="grid gap-2">
          <Label>{labels.compressQuality}</Label>
          <select
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            value={compressQuality}
            onChange={(event) => setCompressQuality(event.target.value as CompressQuality)}
          >
            <option value="strong">{labels.compressStrong}</option>
            <option value="balanced">{labels.compressBalanced}</option>
            <option value="keep">{labels.compressKeep}</option>
          </select>
        </div>
      ) : null}
      {slug === "watermark" ? (
        <div className="grid gap-2">
          <Label>{labels.watermarkLabel}</Label>
          <Input value={watermark} onChange={(event) => setWatermark(event.target.value)} />
        </div>
      ) : null}
      {slug === "rotate" ? (
        <div className="grid gap-2">
          <Label>{labels.rotateAngle}</Label>
          <select
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            value={angle}
            onChange={(event) => setAngle(Number(event.target.value) as 90 | 180 | 270)}
          >
            <option value={90}>90°</option>
            <option value={180}>180°</option>
            <option value={270}>270°</option>
          </select>
        </div>
      ) : null}
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
            <Label>{labels.signatureLabel}</Label>
            <Input value={signature} onChange={(event) => setSignature(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>{labels.signatureImage}</Label>
            <Input
              type="file"
              accept="image/png,image/jpeg,.png,.jpg,.jpeg"
              onChange={(event) => setSignatureImage(event.target.files?.[0])}
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
      {progress ? <p className="text-sm text-muted-foreground">{progress}</p> : null}
      <Button
        onClick={() => void run()}
        disabled={
          !files.length ||
          busy ||
          (slug === "sign" && !signature.trim() && !signatureImage) ||
          (slug === "watermark" && !watermark.trim())
        }
      >
        {busy ? labels.processing : actionCopy(slug, labels, jpgMode)}
      </Button>
    </div>
  );
}
