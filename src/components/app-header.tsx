"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileDown,
  Languages,
  Loader2,
  MoreHorizontal,
  ScanText,
} from "lucide-react";
import { toast } from "sonner";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDisplayLanguage, useLabels } from "@/components/providers";
import { diffCv } from "@/lib/cv-diff";
import { cvHasContent } from "@/lib/cv-utils";
import { useCvStore } from "@/store/cv-store";
import type { CVData } from "@/types/cv";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function AppHeader() {
  const pathname = usePathname();
  const cv = useCvStore((s) => s.cv);
  const uiLanguage = useDisplayLanguage();
  const setUiLanguage = useCvStore((s) => s.setUiLanguage);
  const startAiJob = useCvStore((s) => s.startAiJob);
  const stopAiJob = useCvStore((s) => s.stopAiJob);
  const startReview = useCvStore((s) => s.startReview);
  const screen = useCvStore((s) => s.screen);
  const reset = useCvStore((s) => s.reset);
  const sourceFileName = useCvStore((s) => s.sourceFileName);
  const aiJob = useCvStore((s) => s.aiJob);
  const labels = useLabels();
  const busy = aiJob !== null;
  const hasCvData = cvHasContent(cv);
  const isStudio = pathname === "/studio";
  const showStudioActions = isStudio && screen === "editor";

  async function enhance() {
    if (!hasCvData) return;
    startAiJob("ats");
    try {
      const res = await fetch("/api/enhance-ats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv, targetLanguage: cv.targetLanguage }),
      });
      const json = (await res.json()) as { cv?: CVData; error?: string };
      if (!res.ok || !json.cv) throw new Error(json.error || labels.atsFailed);
      const changes = diffCv(cv, json.cv);
      startReview("ats", json.cv, changes);
      toast.success(labels.atsDone);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : labels.atsFailed);
    } finally {
      stopAiJob();
    }
  }

  async function translate() {
    if (!hasCvData) return;
    const next = uiLanguage === "EN" ? "TR" : "EN";
    startAiJob("translate");
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv, targetLanguage: next }),
      });
      const json = (await res.json()) as { cv?: CVData; error?: string };
      if (!res.ok || !json.cv) throw new Error(json.error || labels.translateFailed);
      const changes = diffCv(cv, json.cv);
      startReview("translate", json.cv, changes);
      toast.success(labels.translateDone);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : labels.translateFailed);
    } finally {
      stopAiJob();
    }
  }

  async function exportPdf() {
    try {
      const { cvToPdfBlob } = await import("@/lib/export-pdf");
      const blob = await cvToPdfBlob(cv);
      downloadBlob(blob, `${cv.personalInfo.fullName || "cv"}.pdf`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "PDF export failed");
    }
  }

  async function exportDocx() {
    try {
      const { cvToDocxBlob } = await import("@/lib/export-docx");
      const blob = await cvToDocxBlob(cv);
      downloadBlob(blob, `${cv.personalInfo.fullName || "cv"}.docx`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Word export failed");
    }
  }

  function startOver() {
    if (!hasCvData || window.confirm(labels.newCvConfirm)) {
      reset();
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1680px] items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3 text-left">
          <BrandMark className="size-9 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="font-heading truncate text-[1.05rem] leading-none tracking-tight">
              {labels.appName}
            </p>
            <p className="mt-1 hidden truncate text-[11px] text-muted-foreground sm:block">
              {isStudio && sourceFileName
                ? `${labels.editingFile}: ${sourceFileName}`
                : isStudio && showStudioActions && hasCvData
                  ? labels.editingDraft
                  : labels.hubKicker}
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-border bg-card p-0.5">
            {(["EN", "TR"] as const).map((lang) => (
              <Button
                key={lang}
                size="sm"
                variant={uiLanguage === lang ? "secondary" : "ghost"}
                className={`h-7 rounded-sm px-2.5 text-[11px] font-semibold tracking-wide ${
                  uiLanguage === lang ? "bg-foreground text-background hover:bg-foreground/90" : ""
                }`}
                onClick={() => setUiLanguage(lang)}
              >
                {lang}
              </Button>
            ))}
          </div>
          {showStudioActions ? (
            <>
              <Button
                variant="outline"
                className="hidden h-9 px-3.5 sm:inline-flex"
                onClick={() => void enhance()}
                disabled={busy || !hasCvData}
              >
                {aiJob === "ats" ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <ScanText />
                )}
                {labels.optimizeAts}
              </Button>
              <Button
                className="hidden h-9 px-3.5 sm:inline-flex"
                onClick={() => void exportPdf()}
                disabled={busy || !hasCvData}
              >
                <FileDown />
                {labels.exportPdf}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label={labels.moreActions}
                    />
                  }
                >
                  <MoreHorizontal />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-48">
                  <DropdownMenuItem
                    className="sm:hidden"
                    onClick={() => void enhance()}
                    disabled={busy || !hasCvData}
                  >
                    {labels.optimizeAts}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="sm:hidden"
                    onClick={() => void exportPdf()}
                    disabled={busy || !hasCvData}
                  >
                    {labels.exportPdf}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => void translate()} disabled={busy || !hasCvData}>
                    <Languages />
                    {labels.translate}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => void exportDocx()} disabled={busy || !hasCvData}>
                    <FileDown />
                    {labels.exportDocx}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={startOver}>{labels.newCv}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
