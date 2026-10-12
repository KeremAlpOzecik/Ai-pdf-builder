"use client";

import { useState } from "react";
import { LOCAL_IMPORT_TR, LOCAL_IMPORT_EN } from "@/lib/import-client";
import { cvHasContent as hasExistingContent } from "@/lib/cv-utils";

import { FileDrop } from "@/components/tools/file-drop";
import { toast } from "sonner";

import { useLabels } from "@/components/providers";
import { parseCvFile } from "@/lib/import-client";
import { useCvStore } from "@/store/cv-store";

export function ImportDropzones() {
  const labels = useLabels();
  const [progress, setProgress] = useState("");
  const setImportText = useCvStore(s => s.setImportText);
  const setCv = useCvStore((s) => s.setCv);
  const startAiJob = useCvStore((s) => s.startAiJob);
  const stopAiJob = useCvStore((s) => s.stopAiJob);
  const setFormTab = useCvStore((s) => s.setFormTab);
  const setSourceFileName = useCvStore((s) => s.setSourceFileName);
  const targetLanguage = useCvStore((s) => s.cv.targetLanguage);
  const aiJob = useCvStore((s) => s.aiJob);
  const busy = aiJob !== null;

  async function send(kind: "pdf" | "image", files: File[]) {
    if (files.length === 0 || useCvStore.getState().aiJob) return;
    if (hasExistingContent(useCvStore.getState().cv) && !window.confirm(targetLanguage === "TR" ? "Mevcut CV taslağı yeni dosyayla değiştirilsin mi?" : "Replace the current CV draft with this file?")) return;
    startAiJob("parse");
    try {
      const cv = await parseCvFile(files, kind, targetLanguage, setProgress);
      setCv(cv.cv);
      setImportText(cv.text);
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
        {targetLanguage === "TR" ? LOCAL_IMPORT_TR : LOCAL_IMPORT_EN}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <FileDrop accept="application/pdf,.pdf" disabled={busy} onFiles={files => void send("pdf", files)}><span className="mt-2 text-sm text-muted-foreground">{labels.dropPdfHint}</span></FileDrop>
        <FileDrop accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp" multiple disabled={busy} onFiles={files => void send("image", files)}><span className="mt-2 text-sm text-muted-foreground">{labels.dropImageHint}</span></FileDrop>
      </div>
      <p role="status" aria-live="polite" className="text-sm text-muted-foreground">{busy ? progress : ""}</p>
    </div>
  );
}
