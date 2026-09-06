import { ToolWorkspace } from "@/components/tools/tool-workspace";
import { TOOL_SLUGS } from "@/lib/tools";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export function generateStaticParams() {
  return TOOL_SLUGS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => ({
    title: `${slug.replaceAll("-", " ")} PDF tool`,
    alternates: { canonical: `/tools/${slug}` },
  }));
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!TOOL_SLUGS.includes(slug as (typeof TOOL_SLUGS)[number])) notFound();
  return <ToolWorkspace slug={slug} />;
}
