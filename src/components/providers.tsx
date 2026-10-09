"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { copy, t } from "@/lib/i18n";
import type { TargetLanguage } from "@/types/cv";
import { useCvStore } from "@/store/cv-store";

type Labels = (typeof copy)[TargetLanguage];
const LabelsContext = createContext<Labels>(copy.TR);
const LangContext = createContext<TargetLanguage>("TR");

export function useLabels() {
  return useContext(LabelsContext);
}

export function useDisplayLanguage() {
  return useContext(LangContext);
}

export function Providers({ children }: { children: ReactNode }) {
  const lang = useCvStore((s) => s.uiLanguage);
  const pathname = usePathname();

  useEffect(() => {
    void useCvStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "TR" ? "tr" : "en";
    const studio = pathname === "/studio";
    const tools = pathname.startsWith("/tools/");
    document.title = lang === "TR"
      ? studio ? "ATS CV Stüdyosu | EkoPDF" : tools ? "Ücretsiz PDF araçları | EkoPDF" : "Ücretsiz PDF düzenle ve ATS uyumlu CV oluştur | EkoPDF"
      : studio ? "ATS CV Studio | EkoPDF" : tools ? "Free PDF tools | EkoPDF" : "Edit PDFs and build an ATS-ready CV for free | EkoPDF";
    const description = lang === "TR"
      ? "PDF düzenleme ve ATS uyumlu CV oluşturma araçları."
      : "PDF editing tools and an ATS-ready CV builder.";
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }, [lang, pathname]);

  const displayLang = lang;

  return (
    <LangContext.Provider value={displayLang}>
      <LabelsContext.Provider value={t(displayLang)}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </LabelsContext.Provider>
    </LangContext.Provider>
  );
}
