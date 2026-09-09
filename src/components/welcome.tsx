"use client";

import { ArrowRight, FilePlus2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { HeroPreview } from "@/components/tools/hero-preview";
import { FileDrop } from "@/components/tools/file-drop";
import { AiProgress } from "@/components/ai-progress";
import { Button } from "@/components/ui/button";
import { parseCvFile } from "@/lib/import-client";
import { cvHasContent } from "@/lib/cv-utils";
import { useLabels } from "@/components/providers";
import { useCvStore } from "@/store/cv-store";

export function Welcome() {
  const cv = useCvStore((s) => s.cv);
  const labels = useLabels();
  const setCv = useCvStore((s) => s.setCv);
  const openEditor = useCvStore((s) => s.openEditor);
  const startAiJob = useCvStore((s) => s.startAiJob);
  const stopAiJob = useCvStore((s) => s.stopAiJob);
  const setSourceFileName = useCvStore((s) => s.setSourceFileName);
  const targetLanguage = useCvStore((s) => s.cv.targetLanguage);
  const aiJob = useCvStore((s) => s.aiJob);
  const busy = aiJob !== null;
  const canContinue = cvHasContent(cv);

  async function importFiles(kind: "pdf" | "image", files: File[]) {
    if (files.length === 0) return;
    startAiJob("parse");
    try {
      const next = await parseCvFile(files, kind, targetLanguage);
      setCv(next);
      setSourceFileName(files.map((file) => file.name).join(", "));
      openEditor("personal");
      toast.success(labels.importDone);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed");
    } finally {
      stopAiJob();
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-10 sm:px-8 sm:py-16">
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            <Sparkles className="size-3.5" /> {labels.welcomeKicker}
          </p>
          <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-6xl">
            {labels.welcomeTitle}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {labels.welcomeSubtitle}
          </p>
      <p className="mt-3 text-sm text-muted-foreground/80">{labels.welcomeNoAccount}</p>
          <p className="mt-3 max-w-xl rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-6 text-muted-foreground">
            {targetLanguage === "TR"
              ? "AI ile içe aktarma CV içeriğini Google Gemini API’ye gönderir. Hassas bilgi yükleme."
              : "AI import sends CV content to the Google Gemini API. Do not upload sensitive information."}
          </p>

      <ol className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
        {[labels.welcomeStep1, labels.welcomeStep2, labels.welcomeStep3].map(
          (step, index) => (
            <li key={step} className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
                {index + 1}
              </span>
              {step}
            </li>
          ),
        )}
      </ol>

      {canContinue ? (
        <Button className="mt-8 h-11 w-fit gap-2 rounded-lg px-5" onClick={() => openEditor()}>
          {labels.welcomeContinue} <ArrowRight className="size-4" />
        </Button>
      ) : null}
        </div>

        <HeroPreview />
      </div>

      <div className="mt-14 grid gap-4 border-t border-border/70 pt-8 sm:grid-cols-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setSourceFileName(null);
            openEditor("personal");
          }}
          className="group rounded-2xl border border-border/70 bg-card p-5 text-left transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_50px_rgb(28_25_23/0.10)]"
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
            <FilePlus2 className="size-5" />
          </span>
          <span className="mt-4 block text-[15px] font-semibold">{labels.welcomeCreate}</span>
          <span className="mt-1.5 block text-[13px] leading-relaxed text-muted-foreground">
            {labels.welcomeCreateHint}
          </span>
        </button>
        <FileDrop accept="application/pdf,.pdf" disabled={busy} onFiles={files => void importFiles("pdf", files)}><span className="mt-2 text-sm text-muted-foreground">{labels.welcomePdfHint}</span></FileDrop>
        <FileDrop accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp" multiple disabled={busy} onFiles={files => void importFiles("image", files)}><span className="mt-2 text-sm text-muted-foreground">{labels.welcomeImageHint}</span></FileDrop>
      </div>
      {busy ? (
        <div className="mt-8">
          <AiProgress />
        </div>
      ) : null}
    </div>
  );
}
