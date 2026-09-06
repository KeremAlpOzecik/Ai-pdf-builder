"use client";

import { ArrowRight, FilePenLine, FilePlus2, ImageIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";
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

  async function importFile(kind: "pdf" | "image", file: File) {
    startAiJob("parse");
    try {
      const next = await parseCvFile(file, kind, targetLanguage);
      setCv(next);
      setSourceFileName(file.name);
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

        <div className="relative hidden min-h-[360px] overflow-hidden rounded-[2rem] bg-[#111827] p-6 text-white shadow-[0_24px_70px_rgb(17_24_39/0.18)] lg:block">
          <div className="absolute -right-16 -top-16 size-52 rounded-full bg-[#8b5cf6]/25 blur-3xl" />
          <div className="absolute -bottom-20 -left-12 size-56 rounded-full bg-[#22c55e]/20 blur-3xl" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-white/60"><span>CV studio</span><span className="rounded-full border border-white/15 px-2.5 py-1">Live preview</span></div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
              <div className="h-3 w-32 rounded-full bg-white/80" />
              <div className="mt-3 h-2 w-48 rounded-full bg-white/30" />
              <div className="mt-7 grid gap-3">
                <div className="h-2 rounded-full bg-white/25" /><div className="h-2 w-5/6 rounded-full bg-white/25" /><div className="h-2 w-2/3 rounded-full bg-white/25" />
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3"><div className="h-16 rounded-xl bg-[#f5d75e]/80" /><div className="h-16 rounded-xl bg-[#d9f3e1]/80" /></div>
            </div>
            <p className="max-w-xs text-sm leading-6 text-white/65">{labels.welcomeCreateHint}</p>
          </div>
        </div>
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
        <label className="group cursor-pointer rounded-2xl border border-border/70 bg-card p-5 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_50px_rgb(28_25_23/0.10)]">
          <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
            <FilePenLine className="size-5" />
          </span>
          <span className="mt-4 block text-[15px] font-semibold">{labels.welcomePdf}</span>
          <span className="mt-1.5 block text-[13px] leading-relaxed text-muted-foreground">
            {labels.welcomePdfHint}
          </span>
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importFile("pdf", file);
              e.currentTarget.value = "";
            }}
          />
        </label>
        <label className="group cursor-pointer rounded-2xl border border-border/70 bg-card p-5 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_50px_rgb(28_25_23/0.10)]">
          <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
            <ImageIcon className="size-5" />
          </span>
          <span className="mt-4 block text-[15px] font-semibold">{labels.welcomeImage}</span>
          <span className="mt-1.5 block text-[13px] leading-relaxed text-muted-foreground">
            {labels.welcomeImageHint}
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importFile("image", file);
              e.currentTarget.value = "";
            }}
          />
        </label>
      </div>
      {busy ? (
        <div className="mt-8">
          <AiProgress />
        </div>
      ) : null}
    </div>
  );
}
