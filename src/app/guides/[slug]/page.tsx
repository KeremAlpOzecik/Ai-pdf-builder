import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { JsonLd } from "@/components/seo/json-ld";
import { getGuide, guides } from "@/lib/guides";
import { absoluteUrl, pageMetadata, SEO_UPDATED_AT, SITE_NAME } from "@/lib/seo";

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  return pageMetadata({
    title: guide.title,
    description: guide.description,
    keywords: guide.keywords,
    path: `/guides/${guide.slug}`,
    type: "article",
  });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  const url = absoluteUrl(`/guides/${guide.slug}`);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    image: absoluteUrl("/opengraph-image"),
    dateModified: SEO_UPDATED_AT,
    inLanguage: "tr-TR",
    author: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl() },
    publisher: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl() },
    mainEntityOfPage: url,
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana sayfa", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Rehberler", item: absoluteUrl("/guides") },
      { "@type": "ListItem", position: 3, name: guide.title, item: url },
    ],
  };

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <AppHeader />
      <main className="px-5 py-12 sm:px-8 sm:py-20">
        <article className="mx-auto max-w-3xl">
          <p className="text-sm text-muted-foreground">
            <Link href="/" className="hover:underline">
              Ana sayfa
            </Link>
            {" / "}
            <Link href="/guides" className="hover:underline">
              Rehberler
            </Link>
          </p>
          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.16em] text-primary">{guide.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">{guide.title}</h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">{guide.intro}</p>
          <div className="mt-12 space-y-10">
            {guide.sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-2xl font-semibold tracking-tight">{section.title}</h2>
                <p className="mt-3 text-base leading-7 text-muted-foreground">{section.body}</p>
              </section>
            ))}
          </div>
          <aside className="mt-14 rounded-2xl border border-border/70 bg-card p-6">
            <h2 className="text-lg font-semibold">Hemen dene</h2>
            <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
              {guide.related.map((item) => (
                <Link key={item.href} href={item.href} className="text-primary underline underline-offset-4">
                  {item.label} →
                </Link>
              ))}
            </div>
          </aside>
        </article>
      </main>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumb} />
    </div>
  );
}
