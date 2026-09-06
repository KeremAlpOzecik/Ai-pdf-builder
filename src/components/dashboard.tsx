"use client";

import { motion } from "framer-motion";
import { FileDown } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/app-header";
import { CvForm } from "@/components/cv-form";
import { CvPreview } from "@/components/cv-preview";
import { Welcome } from "@/components/welcome";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cvHasContent } from "@/lib/cv-utils";
import { useLabels } from "@/components/providers";
import { useCvStore } from "@/store/cv-store";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function Dashboard() {
  const cv = useCvStore((s) => s.cv);
  const mobileView = useCvStore((s) => s.mobileView);
  const setMobileView = useCvStore((s) => s.setMobileView);
  const screen = useCvStore((s) => s.screen);
  const labels = useLabels();
  const canExport = cvHasContent(cv);

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

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <AppHeader />
      {screen === "home" ? (
        <Welcome />
      ) : (
        <>
          <div className="mx-auto grid w-full max-w-[1680px] flex-1 grid-cols-1 gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-6">
            <motion.section
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`min-h-0 rounded-2xl border border-border bg-card p-5 shadow-[0_1px_0_rgb(28_25_23/0.04)] sm:p-6 ${mobileView === "preview" ? "hidden lg:block" : ""}`}
            >
              <ScrollArea className="h-[calc(100vh-8.75rem)] pr-3">
                <CvForm />
              </ScrollArea>
            </motion.section>
            <motion.section
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 }}
              className={`min-h-0 rounded-2xl border border-border/80 bg-[oklch(0.93_0.014_80)] p-5 sm:p-6 ${mobileView === "edit" ? "hidden lg:block" : ""}`}
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{labels.previewActions}</p>
                  <p className="text-[11px] text-muted-foreground">{labels.previewHint}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="h-8"
                    onClick={() => void exportPdf()}
                    disabled={!canExport}
                  >
                    <FileDown data-icon="inline-start" />
                    {labels.exportPdf}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 bg-card"
                    onClick={() => void exportDocx()}
                    disabled={!canExport}
                  >
                    {labels.exportDocx}
                  </Button>
                </div>
              </div>
              <ScrollArea className="h-[calc(100vh-12.25rem)]">
                <CvPreview cv={cv} />
              </ScrollArea>
            </motion.section>
          </div>
          <nav className="sticky bottom-0 z-20 grid grid-cols-2 gap-1 border-t border-border bg-background p-2 lg:hidden">
            <Button
              variant={mobileView === "edit" ? "default" : "ghost"}
              onClick={() => setMobileView("edit")}
            >
              {labels.edit}
            </Button>
            <Button
              variant={mobileView === "preview" ? "default" : "ghost"}
              onClick={() => setMobileView("preview")}
            >
              {labels.preview}
            </Button>
          </nav>
        </>
      )}
    </div>
  );
}
