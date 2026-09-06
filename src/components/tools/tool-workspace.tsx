"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EditPdfEditor } from "@/components/tools/edit-pdf-editor";
import { FileDrop } from "@/components/tools/file-drop";
import { ToolShell } from "@/components/tools/tool-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { downloadBlob, stem } from "@/lib/download";
import { copy } from "@/lib/i18n";
import { useLabels } from "@/components/providers";
import { compressPdf, imagesToPdf, mergePdfs, pdfToJpegs, splitPdf } from "@/lib/pdf/ops";
import { docxToPdf, pdfToDocx } from "@/lib/pdf/word";
import { openPdf } from "@/lib/pdf/pdfjs-client";
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
    <ToolShell title={title} hint={hint} wide={slug === "edit-pdf"}>
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

  const accept = useMemo(() => {
    if (slug === "word-to-pdf") return ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (slug === "jpg-pdf" && jpgMode === "to-pdf") return "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";
    return "application/pdf,.pdf";
  }, [slug, jpgMode]);

  const multiple =
    slug === "merge" || (slug === "jpg-pdf" && jpgMode === "to-pdf");

  async function onFiles(next: File[]) {
    setFiles(multiple ? (prev) => [...prev, ...next] : [next[0]]);
    if ((slug === "split" || slug === "compress" || slug === "pdf-to-word") && next[0]) {
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

  async function run() {
    if (!files.length) return;
    setBusy(true);
    try {
      if (slug === "word-to-pdf") {
        const bytes = await docxToPdf(files[0]);
        downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), `${stem(files[0].name)}.pdf`);
      } else if (slug === "pdf-to-word") {
        const blob = await pdfToDocx(files[0]);
        downloadBlob(blob, `${stem(files[0].name)}.docx`);
      } else if (slug === "merge") {
        const bytes = await mergePdfs(files);
        downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), "merged.pdf");
      } else if (slug === "split") {
        const bytes = await splitPdf(files[0], fromPage, toPage);
        downloadBlob(
          new Blob([bytes as BlobPart], { type: "application/pdf" }),
          `${stem(files[0].name)}-p${fromPage}-${toPage}.pdf`,
        );
      } else if (slug === "compress") {
        const bytes = await compressPdf(files[0]);
        downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), `${stem(files[0].name)}-small.pdf`);
      } else if (jpgMode === "to-pdf") {
        const bytes = await imagesToPdf(files);
        downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), "images.pdf");
      } else {
        const pages = await pdfToJpegs(files[0]);
        for (const page of pages) downloadBlob(page.blob, page.name);
      }
      toast.success(labels.toolDone);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : labels.toolFailed);
    } finally {
      setBusy(false);
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
      <Button onClick={() => void run()} disabled={!files.length || busy}>
        {busy ? labels.processing : labels.runTool}
      </Button>
    </div>
  );
}
