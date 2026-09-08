import Link from "next/link";
import { guides } from "@/lib/guides";
import { toolSeo } from "@/lib/tool-seo";

const tools = Object.values(toolSeo);

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-3">
        <div>
          <p className="font-heading text-base tracking-tight">AI CV Builder</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            Ücretsiz PDF düzenle, OCR, imza, filigran, Word çevir veya sıkıştır. LinkedIn özgeçmişini tarayıcıda ATS
            uyumlu hale getir. Hesap yok.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Araçlar</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link className="hover:underline" href="/studio">
                ATS uyumlu CV stüdyosu
              </Link>
            </li>
            {tools.map((tool) => (
              <li key={tool.slug}>
                <Link className="hover:underline" href={`/tools/${tool.slug}`}>
                  {tool.h1}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Rehberler</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link className="hover:underline" href="/guides">
                Tüm PDF ve CV rehberleri
              </Link>
            </li>
            {guides.map((guide) => (
              <li key={guide.slug}>
                <Link className="hover:underline" href={`/guides/${guide.slug}`}>
                  {guide.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
