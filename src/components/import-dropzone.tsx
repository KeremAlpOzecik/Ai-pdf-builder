"use client";

import { FileText, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { AiProgress } from "@/components/ai-progress";
import { useLabels } from "@/components/providers";
import { parseCvFile } from "@/lib/import-client";
import { useCvStore } from "@/store/cv-store";

export function ImportDropzones() {
  const labels = useLabels();
  const setCv = useCvStore((s) => s.setCv);
  const startAiJob = useCvStore((s) => s.startAiJob);
  const stopAiJob = useCvStore((s) => s.stopAiJob);
  const setFormTab = useCvStore((s) => s.setFormTab);
  const setSourceFileName = useCvStore((s) => s.setSourceFileName);
  const targetLanguage = useCvStore((s) => s.cv.targetLanguage);
  const aiJob = useCvStore((s) => s.aiJob);
  const busy = aiJob !== null;

  async function send(kind: "pdf" | "image", files: File[]) {
    if (files.length === 0) return;
    startAiJob("parse");
    try {
      const cv = await parseCvFile(files, kind, targetLanguage);
      setCv(cv);
      setSourceFileName(files.map((file) => file.name).join(", "));
      setFormTab("personal");
      toast.success(labels.importDone);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed");
    } finally {
      stopAiJob();
    }
  }

  return (
    <div className="space-y-5">
      <p className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-6 text-muted-foreground">
        {targetLanguage === "TR"
          ? "AI içe aktarma CV metnini veya görselini Google Gemini API’ye gönderir. Hassas bilgileri yükleme."
          : "AI import sends CV text or images to the Google Gemini API. Do not upload sensitive information."}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex cursor-pointer flex-col gap-3 rounded-xl border border-dashed border-border bg-muted/20 p-5 transition hover:border-foreground/25 hover:bg-muted/35">
          <span className="flex size-10 items-center justify-center rounded-md border border-border bg-card text-foreground">
            <FileText className="size-5" />
          </span>
          <span className="text-sm font-semibold">{labels.dropPdf}</span>
          <span className="text-[13px] leading-relaxed text-muted-foreground">
            {labels.dropPdfHint}
          </span>
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length) void send("pdf", files);
              e.currentTarget.value = "";
            }}
          />
        </label>
        <label className="flex cursor-pointer flex-col gap-3 rounded-xl border border-dashed border-border bg-muted/20 p-5 transition hover:border-foreground/25 hover:bg-muted/35">
          <span className="flex size-10 items-center justify-center rounded-md border border-border bg-card text-foreground">
            <ImageIcon className="size-5" />
          </span>
          <span className="text-sm font-semibold">{labels.dropImage}</span>
          <span className="text-[13px] leading-relaxed text-muted-foreground">
            {labels.dropImageHint}
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            multiple
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length) void send("image", files);
              e.currentTarget.value = "";
            }}
          />
        </label>
      </div>
      <AiProgress />
    </div>
  );
}
