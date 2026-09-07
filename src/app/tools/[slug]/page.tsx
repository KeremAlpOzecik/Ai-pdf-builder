import { ToolWorkspace } from "@/components/tools/tool-workspace";
import { ToolArticle } from "@/components/seo/tool-article";
import { TOOL_SLUGS } from "@/lib/tools";
import { getToolSeo } from "@/lib/tool-seo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export function generateStaticParams() {
  return TOOL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const seo = getToolSeo(slug);
  if (!seo) {
    return {
      title: "Ücretsiz PDF aracı",
      description: "Ücretsiz PDF araçlarıyla dosyalarını tarayıcıda kolayca işle.",
    };
  }
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical: `/tools/${slug}` },
    openGraph: { title: seo.title, description: seo.description, url: `/tools/${slug}` },
    twitter: { title: seo.title, description: seo.description },
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!TOOL_SLUGS.includes(slug as (typeof TOOL_SLUGS)[number])) notFound();
  return (
    <>
      <ToolWorkspace slug={slug} />
      <ToolArticle slug={slug} />
    </>
  );
}
