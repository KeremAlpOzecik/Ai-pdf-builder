"use client";

import Link from "next/link";
import { HeroPreview } from "@/components/tools/hero-preview";
import {
  FileImage,
  FilePenLine,
  FilePlus2,
  Files,
  FileScan,
  FileType2,
  Hash,
  Minimize2,
  PenLine,
  RotateCw,
  Scissors,
  Stamp,
  UserRound,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { useDisplayLanguage, useLabels } from "@/components/providers";

export function ToolsHub() {
  const labels = useLabels();
  const tr = useDisplayLanguage() === "TR";
  const cards = [
    {
      href: "/studio",
      icon: UserRound,
      title: labels.studioCardTitle,
      hint: labels.studioCardHint,
    },
    {
      href: "/tools/edit-pdf",
      icon: FilePenLine,
      title: labels.toolEditPdf,
      hint: labels.toolEditPdfHint,
    },
    {
      href: "/tools/word-to-pdf",
      icon: FileType2,
      title: labels.toolWordPdf,
      hint: labels.toolWordPdfHint,
    },
    {
      href: "/tools/pdf-to-word",
      icon: FilePlus2,
      title: labels.toolPdfWord,
      hint: labels.toolPdfWordHint,
    },
    {
      href: "/tools/merge",
      icon: Files,
      title: labels.toolMerge,
      hint: labels.toolMergeHint,
    },
    {
      href: "/tools/split",
      icon: Scissors,
      title: labels.toolSplit,
      hint: labels.toolSplitHint,
    },
    {
      href: "/tools/compress",
      icon: Minimize2,
      title: labels.toolCompress,
      hint: labels.toolCompressHint,
    },
    {
      href: "/tools/jpg-pdf",
      icon: FileImage,
      title: labels.toolJpgPdf,
      hint: labels.toolJpgPdfHint,
    },
  ];
  const premium = [
    {
      href: "/tools/ocr",
      icon: FileScan,
      title: labels.toolOcr,
      hint: labels.toolOcrHint,
    },
    {
      href: "/tools/sign",
      icon: PenLine,
      title: labels.toolSign,
      hint: labels.toolSignHint,
    },
    {
      href: "/tools/watermark",
      icon: Stamp,
      title: labels.toolWatermark,
      hint: labels.toolWatermarkHint,
    },
    {
      href: "/tools/rotate",
      icon: RotateCw,
      title: labels.toolRotate,
      hint: labels.toolRotateHint,
    },
    {
      href: "/tools/page-numbers",
      icon: Hash,
      title: labels.toolPageNumbers,
      hint: labels.toolPageNumbersHint,
    },
  ];

  return (
    <div className="min-h-full flex-1 bg-background">
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl px-5 pb-16 pt-10 sm:px-8 sm:pt-8 lg:pt-10">
        <section className="grid items-center gap-12 py-6 lg:grid-cols-[1.2fr_0.8fr] lg:py-12">
          <div>
            <p className="text-sm font-semibold text-primary">{tr ? "PDF araçları ve CV stüdyosu" : "PDF tools & CV studio"}</p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl lg:text-[56px]">{tr ? "Ücretsiz PDF düzenle ve ATS uyumlu CV oluştur" : "Edit PDFs and build an ATS-ready CV for free"}</h1>
            <p className="mt-6 max-w-xl text-lg leading-7 text-muted-foreground">{tr ? "PDF’lerinizi düzenleyin, dönüştürün ve birleştirin. CV stüdyosunda özgeçmişinizi hazırlayın, AI önerilerini inceleyin ve indirin." : "Edit, convert and merge PDFs. Build your resume in CV Studio, review AI suggestions and download."}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/tools/edit-pdf" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground hover:bg-primary/90"><FilePenLine className="size-4" />{tr ? "PDF yükle ve başla" : "Upload a PDF to start"}<ArrowUpRight className="size-4" /></Link>
              <Link href="/studio" className="inline-flex min-h-12 items-center gap-2 rounded-xl border bg-card px-5 font-semibold hover:bg-muted"><Sparkles className="size-4" />{tr ? "CV Stüdyosunu aç" : "Open CV Studio"}</Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground"><span>{tr ? "✓ Kayıt gerektirmez" : "✓ No account needed"}</span><span>{tr ? "✓ Ücretsiz" : "✓ Free"}</span><span className="flex items-center gap-1"><ShieldCheck className="size-4" />{tr ? "PDF işlemleri cihazınızda" : "PDF processing on your device"}</span></div>
          </div>
          <HeroPreview />
        </section>

        <section className="mt-12 sm:mt-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{labels.hubKicker}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{tr ? "En popüler araçlar" : "Popular tools"}</h2>
            </div>
            <p className="hidden max-w-xs text-right text-sm leading-6 text-muted-foreground sm:block">{tr ? "PDF araçları dosyalarınızı cihazınızda işler." : "PDF tools process files on your device."}</p>
          </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[cards[0], cards[1], cards[3], cards[6]].map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group relative flex min-h-52 flex-col rounded-2xl border border-border/70 bg-card p-5 transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_50px_rgb(28_25_23/0.10)]"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
                <card.icon className="size-5" />
              </span>
              <span className="mt-8 block text-base font-semibold tracking-tight">{card.title}</span>
              <span className="mt-2 block text-sm leading-6 text-muted-foreground">
                {card.hint}
              </span>
              <ArrowUpRight className="absolute bottom-5 right-5 size-4 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </div>
        </section>

        <section id="tools" className="scroll-mt-24 mt-14 sm:mt-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{labels.premiumKicker}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{tr ? "Tüm PDF araçları" : "All PDF tools"}</h2>
            </div>
            <p className="hidden max-w-sm text-right text-sm leading-6 text-muted-foreground sm:block">{labels.premiumHint}</p>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[cards[2], cards[4], cards[5], cards[7], ...premium].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group relative flex min-h-0 flex-col rounded-2xl border border-border/70 bg-transparent p-4 transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_50px_rgb(28_25_23/0.10)]"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <card.icon className="size-5" />
                </span>
                <span className="mt-4 block text-base font-semibold tracking-tight">{card.title}</span>
                <span className="mt-2 block text-sm leading-6 text-muted-foreground">{card.hint}</span>
                <ArrowUpRight className="absolute bottom-5 right-5 size-4 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
