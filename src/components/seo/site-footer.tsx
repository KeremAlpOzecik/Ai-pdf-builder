"use client";

import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { guides } from "@/lib/guides";
import { toolSeo } from "@/lib/tool-seo";
import { useDisplayLanguage, useLabels } from "@/components/providers";

const tools = Object.values(toolSeo);

export function SiteFooter() {
  const tr = useDisplayLanguage() === "TR";
  const labels = useLabels();
  const toolNames: Record<string, string> = {
    "edit-pdf": labels.toolEditPdf, "word-to-pdf": labels.toolWordPdf, "pdf-to-word": labels.toolPdfWord,
    merge: labels.toolMerge, split: labels.toolSplit, compress: labels.toolCompress, "jpg-pdf": labels.toolJpgPdf,
    ocr: labels.toolOcr, sign: labels.toolSign, watermark: labels.toolWatermark, rotate: labels.toolRotate,
    "page-numbers": labels.toolPageNumbers,
  };
  return (
    <footer className="border-t border-border/70 bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-3">
        <div>
          <Link href="/" className="inline-flex items-center gap-3"><BrandMark className="size-10 shrink-0" /><span className="font-heading text-2xl font-semibold tracking-tight">EkoPDF</span></Link>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            {tr ? "Ücretsiz PDF düzenle, OCR, imza, filigran, Word çevir veya sıkıştır. LinkedIn özgeçmişini tarayıcıda ATS uyumlu hale getir. Hesap yok." : "Edit PDFs, run OCR, add signatures or watermarks, convert Word files, and compress documents for free. Build an ATS-ready resume in your browser. No account required."}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{tr ? "Araçlar" : "Tools"}</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link className="hover:underline" href="/studio">
                {tr ? "ATS uyumlu CV stüdyosu" : "ATS-ready CV studio"}
              </Link>
            </li>
            {tools.map((tool) => (
              <li key={tool.slug}>
                <Link className="hover:underline" href={`/tools/${tool.slug}`}>
                  {tr ? tool.h1 : toolNames[tool.slug]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{tr ? "Rehberler" : "Guides"}</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link className="hover:underline" href="/guides">
                {tr ? "Tüm PDF ve CV rehberleri" : "All PDF and CV guides"}
              </Link>
            </li>
            {guides.map((guide) => (
              <li key={guide.slug}>
                <Link className="hover:underline" href={`/guides/${guide.slug}`}>
                  {tr ? guide.title : `PDF & CV guide ${guides.indexOf(guide) + 1}`}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap gap-x-5 gap-y-2 border-t border-border/70 px-5 py-5 text-xs text-muted-foreground sm:px-8">
        <Link className="hover:text-foreground hover:underline" href="/privacy">{tr ? "Gizlilik politikası" : "Privacy policy"}</Link>
        <Link className="hover:text-foreground hover:underline" href="/terms">{tr ? "Kullanım şartları" : "Terms of use"}</Link>
        <span>{tr ? "Temel PDF araçları tarayıcıda çalışır; AI özellikleri Google Gemini kullanır; ATS önerilerinde Groq yedektir." : "Core PDF tools run in your browser; AI features use Google Gemini; ATS suggestions may use Groq as a backup."}</span>
      </div>
    </footer>
  );
}
