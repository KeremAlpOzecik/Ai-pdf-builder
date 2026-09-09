import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { AppHeader } from "@/components/app-header";
import { guides } from "@/lib/guides";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "PDF ve CV rehberleri",
  description:
    "LinkedIn CV PDF düzenleme, ATS uyumlu Türkçe özgeçmiş, yazım hatası düzeltme ve ücretsiz PDF birleştirme rehberleri.",
  alternates: { canonical: "/guides" },
  openGraph: {
    title: "PDF ve CV rehberleri",
    description: "ATS uyumlu CV ve ücretsiz PDF işlemleri için kısa, uygulanabilir rehberler.",
    url: "/guides",
  },
};

export default function GuidesIndexPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Rehberler</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          LinkedIn CV PDF, ATS özgeçmiş ve ücretsiz PDF işlemleri
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
          LinkedIn özgeçmişini düzenleme, CV’de yazım hatalarını düzeltme, ATS için okunabilir bir belge hazırlama
          ve PDF dönüştürme adımlarını öğren. İhtiyacına uygun rehberi seçip ilgili aracı ücretsiz kullanabilirsin.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="rounded-2xl border border-border/70 bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/40"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{guide.eyebrow}</p>
              <h2 className="mt-3 text-lg font-semibold tracking-tight">{guide.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{guide.description}</p>
            </Link>
          ))}
        </div>
      </main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "PDF ve CV rehberleri",
          url: absoluteUrl("/guides"),
        }}
      />
    </div>
  );
}
