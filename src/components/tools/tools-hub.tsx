"use client";

import Link from "next/link";
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
import { useLabels } from "@/components/providers";

export function ToolsHub() {
  const labels = useLabels();
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
      <main className="mx-auto w-full max-w-7xl px-5 pb-16 pt-10 sm:px-8 sm:pt-16 lg:pt-20">
        <section className="relative overflow-hidden rounded-[2rem] bg-[#111827] px-6 py-12 text-white sm:px-12 sm:py-16 lg:px-16 lg:py-20">
          <div className="absolute -right-24 -top-28 size-80 rounded-full bg-[#8b5cf6]/25 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 size-72 rounded-full bg-[#22c55e]/15 blur-3xl" />
          <div className="relative max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">{labels.hubKicker}</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5" /> {labels.hubPrivacy}</span>
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.06] tracking-[-0.04em] sm:text-6xl">
              {labels.hubTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
              {labels.hubSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/studio" className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-[#111827] transition hover:bg-white/90">
                <Sparkles className="size-4" /> {labels.studioCardTitle} <ArrowUpRight className="size-4" />
              </Link>
              <span className="inline-flex items-center rounded-lg border border-white/15 px-4 text-sm text-white/65">{labels.tagline}</span>
            </div>
          </div>
        </section>

        <section className="mt-12 sm:mt-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{labels.hubKicker}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{labels.hubKicker}</h2>
            </div>
            <p className="hidden max-w-xs text-right text-sm leading-6 text-muted-foreground sm:block">{labels.hubPrivacy}</p>
          </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
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

        <section className="mt-14 sm:mt-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{labels.premiumKicker}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{labels.premiumKicker}</h2>
            </div>
            <p className="hidden max-w-sm text-right text-sm leading-6 text-muted-foreground sm:block">{labels.premiumHint}</p>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {premium.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group relative flex min-h-52 flex-col rounded-2xl border border-border/70 bg-card p-5 transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_50px_rgb(28_25_23/0.10)]"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <card.icon className="size-5" />
                </span>
                <span className="mt-8 block text-base font-semibold tracking-tight">{card.title}</span>
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
