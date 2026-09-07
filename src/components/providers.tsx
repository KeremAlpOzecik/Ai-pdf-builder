"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
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

  useEffect(() => {
    void useCvStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "TR" ? "tr" : "en";
  }, [lang]);

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
