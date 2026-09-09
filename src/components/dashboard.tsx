"use client";

import { useState } from "react";
import { ChangeSummary } from "@/components/change-summary";
import { FileDown } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/app-header";
import { CvForm } from "@/components/cv-form";
import { ScaledCvPreview } from "@/components/scaled-cv-preview";
import { ResumeTemplatePicker } from "@/components/resume-template-picker";
import { Welcome } from "@/components/welcome";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cvHasContent } from "@/lib/cv-utils";
import { useDisplayLanguage, useLabels } from "@/components/providers";
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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [exporting, setExporting] = useState(false);
  const cv = useCvStore((s) => s.cv);
  const mobileView = useCvStore((s) => s.mobileView);
  const setMobileView = useCvStore((s) => s.setMobileView);
  const screen = useCvStore((s) => s.screen);
  const resumeTemplate = useCvStore((s) => s.resumeTemplate);
  const labels = useLabels();
  const tr = useDisplayLanguage() === "TR";
  const setFormTab = useCvStore(s => s.setFormTab);
  const canExport = cvHasContent(cv);

  async function exportPdf() {
    setExporting(true);
    try {
      const { cvToPdfBlob } = await import("@/lib/export-pdf");
      const blob = await cvToPdfBlob(cv, resumeTemplate);
      downloadBlob(blob, `${cv.personalInfo.fullName || "cv"}.pdf`);
    } catch (error) {
      console.error("CV PDF export failed", error);
      toast.error(tr ? "PDF oluşturulamadı. Yeniden deneyin." : "PDF export failed. Please retry.");
    } finally {
      setExporting(false);
    }
  }

  async function exportDocx() {
    setExporting(true);
    try {
      const { cvToDocxBlob } = await import("@/lib/export-docx");
      const blob = await cvToDocxBlob(cv, resumeTemplate);
      downloadBlob(blob, `${cv.personalInfo.fullName || "cv"}.docx`);
    } catch (error) {
      console.error("CV Word export failed", error);
      toast.error(tr ? "Word dosyası oluşturulamadı. Yeniden deneyin." : "Word export failed. Please retry.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <AppHeader />
      <main className="flex min-w-0 flex-1 flex-col">
      {screen === "home" ? (
        <Welcome />
      ) : (
        <>
          <div className="mx-auto w-full max-w-[1680px] px-4 pt-6 sm:px-6"><h1 className="text-2xl font-semibold">{tr ? "ATS CV Stüdyosu" : "ATS CV Studio"}</h1><ol className="mt-4 flex flex-wrap gap-2 text-sm">{[tr ? "Bilgilerini gir" : "Enter your details", tr ? "Şablon seç" : "Choose a template", tr ? "Önizle ve indir" : "Preview & download"].map((step, i) => <li key={step}><button className="rounded-lg border bg-card px-3 py-2 hover:border-primary" onClick={() => { setShowSuggestions(false); setMobileView(i === 0 ? "edit" : "preview"); if (i === 0) setFormTab("personal"); if (i === 1) document.getElementById("resume-template-label")?.scrollIntoView({ block: "center" }); }}>{i + 1}. {step}</button></li>)}</ol></div>
          <div className="mx-auto grid w-full max-w-[1680px] flex-1 grid-cols-1 gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:grid-cols-[minmax(300px,0.9fr)_minmax(0,1.3fr)_minmax(240px,0.7fr)] lg:gap-6">
            <section
              className={`min-w-0 min-h-0 rounded-2xl border border-border bg-card p-5 shadow-[0_1px_0_rgb(28_25_23/0.04)] sm:p-6 ${(mobileView === "preview" || showSuggestions) ? "hidden lg:block" : ""}`}
            >
              <ScrollArea className="h-[calc(100dvh-15rem)] pr-3">
                <CvForm />
              </ScrollArea>
            </section>
            <section
              className={`h-[calc(100dvh-15rem)] min-w-0 min-h-0 flex-col rounded-2xl border border-border/80 bg-muted p-5 sm:p-6 ${(mobileView === "edit" || showSuggestions) ? "hidden lg:flex" : "flex"}`}
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{labels.previewActions}</p>
                  <p className="text-sm text-muted-foreground">{labels.previewHint}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="h-8"
                    onClick={() => void exportPdf()}
                    disabled={!canExport || exporting}
                  >
                    <FileDown data-icon="inline-start" />
                    {labels.exportPdf}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 bg-card"
                    onClick={() => void exportDocx()}
                    disabled={!canExport || exporting}
                  >
                    {labels.exportDocx}
                  </Button>
                </div>
              </div>
              <ResumeTemplatePicker />
              <ScrollArea className="min-h-0 flex-1">
                <ScaledCvPreview interactive cv={cv} template={resumeTemplate} />
              </ScrollArea>
            </section>
            <aside className={`min-w-0 rounded-2xl border bg-card p-4 lg:col-span-2 xl:col-span-1 ${showSuggestions ? "" : "hidden lg:block"}`}><h2 className="text-lg font-semibold">{tr ? "AI önerileri" : "AI suggestions"}</h2><p className="my-3 text-sm leading-6 text-muted-foreground">{tr ? "ATS önerisi veya çeviri istediğinizde CV içeriğiniz Google Gemini API’ye gönderilir. Önerileri tek tek uygulayabilir veya reddedebilirsiniz. İçeriğiniz onayınız olmadan değişmez." : "When you request ATS suggestions or translation, your CV content is sent to the Google Gemini API. Apply or dismiss each suggestion; your content changes only with your approval."}</p><p className="mb-4 text-sm text-muted-foreground">{tr ? "Öneri almak için üst menüdeki ATS iyileştirme eylemini kullanın." : "Use the ATS improvement action in the top menu to request suggestions."}</p><ChangeSummary /></aside>
          </div>
          <nav className="sticky bottom-0 z-20 grid grid-cols-3 gap-1 border-t border-border bg-background p-2 lg:hidden">
            <Button
              variant={!showSuggestions && mobileView === "edit" ? "default" : "ghost"}
              onClick={() => { setShowSuggestions(false); setMobileView("edit"); }}
            >
              {labels.edit}
            </Button>
            <Button
              variant={!showSuggestions && mobileView === "preview" ? "default" : "ghost"}
              onClick={() => { setShowSuggestions(false); setMobileView("preview"); }}
            >
              {labels.preview}
            </Button>
            <Button variant={showSuggestions ? "default" : "ghost"} onClick={() => setShowSuggestions(true)}>{tr ? "AI önerileri" : "AI suggestions"}</Button>
          </nav>
        </>
      )}
      </main>
    </div>
  );
}
