import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuide, guides } from "@/lib/guides";

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: { title: guide.title, description: guide.description, url: `/guides/${guide.slug}` },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    author: { "@type": "Organization", name: "AI CV Builder" },
    publisher: { "@type": "Organization", name: "AI CV Builder" },
    mainEntityOfPage: `https://ai-pdf-builder.vercel.app/guides/${guide.slug}`,
  };

  return (
    <main className="min-h-screen bg-background px-5 py-12 sm:px-8 sm:py-20">
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-semibold text-primary underline underline-offset-4">← Ücretsiz PDF araçlarına dön</Link>
        <p className="mt-12 text-xs font-semibold uppercase tracking-[0.16em] text-primary">{guide.eyebrow}</p>
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
            {guide.related.map((item) => <Link key={item.href} href={item.href} className="text-primary underline underline-offset-4">{item.label} →</Link>)}
          </div>
        </aside>
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
    </main>
  );
}
