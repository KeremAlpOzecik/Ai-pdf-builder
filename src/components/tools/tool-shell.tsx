"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { useDisplayLanguage, useLabels } from "@/components/providers";

export function ToolShell({
  title,
  hint,
  wide,
  children,
}: {
  title: string;
  hint: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  const labels = useLabels();
  const tr = useDisplayLanguage() === "TR";
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <AppHeader />
      <main
        className={`mx-auto flex w-full flex-1 flex-col px-4 py-8 sm:px-8 ${wide ? "max-w-[1440px]" : "max-w-5xl"}`}
      >
        <nav aria-label={tr ? "İçerik yolu" : "Breadcrumb"}><Link
          href="/#tools"
          className="text-[12px] font-medium text-muted-foreground hover:text-foreground"
        >
          ← {labels.toolsHome}
        </Link></nav>
        <div className="mt-4 flex items-center gap-3"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><FileText className="size-6" /></span><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1></div>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">{hint}</p>
        <p className="mt-4 text-sm font-medium text-primary">{tr ? "✓ Dosyalarınız tarayıcınızda işlenir. Kayıt gerekmez." : "✓ Files are processed in your browser. No account needed."}</p>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
