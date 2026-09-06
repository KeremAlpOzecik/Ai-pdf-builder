import { ToolWorkspace } from "@/components/tools/tool-workspace";
import { TOOL_SLUGS } from "@/lib/tools";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const toolSeo: Record<string, { title: string; description: string; keywords: string[] }> = {
  "edit-pdf": {
    title: "Ücretsiz PDF Düzenleyici",
    description: "PDF dosyanı tarayıcıda aç, metinleri düzenle ve güncel PDF’i ücretsiz indir.",
    keywords: ["PDF düzenleyici", "ücretsiz PDF düzenleme", "online PDF editörü"],
  },
  "word-to-pdf": {
    title: "Word’ü PDF’e Çevir",
    description: "DOCX dosyalarını tarayıcıda hızlı ve ücretsiz şekilde PDF’e dönüştür.",
    keywords: ["Word PDF çevirme", "DOCX PDF", "ücretsiz Word dönüştürücü"],
  },
  "pdf-to-word": {
    title: "PDF’i Word’e Çevir",
    description: "PDF metnini düzenlenebilir Word dosyasına ücretsiz olarak aktar.",
    keywords: ["PDF Word çevirme", "PDF to DOCX", "ücretsiz PDF dönüştürücü"],
  },
  merge: {
    title: "PDF Birleştir",
    description: "Birden fazla PDF dosyasını tek belgede birleştir ve ücretsiz indir.",
    keywords: ["PDF birleştirme", "PDF birleştir ücretsiz", "online PDF merger"],
  },
  split: {
    title: "PDF Böl",
    description: "PDF’ten istediğin sayfa aralığını ayırıp yeni dosya olarak indir.",
    keywords: ["PDF bölme", "PDF sayfa ayırma", "PDF split"],
  },
  compress: {
    title: "PDF Sıkıştır",
    description: "PDF dosya boyutunu küçült, paylaşmayı ve yüklemeyi kolaylaştır.",
    keywords: ["PDF sıkıştırma", "PDF boyutu küçültme", "compress PDF"],
  },
  "jpg-pdf": {
    title: "JPG’yi PDF’e Çevir",
    description: "JPG, PNG ve WEBP görsellerini PDF’e çevir veya PDF sayfalarını JPG olarak indir.",
    keywords: ["JPG PDF çevirme", "görseli PDF yapma", "PDF JPG dönüştürme"],
  },
};

export function generateStaticParams() {
  return TOOL_SLUGS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const seo = toolSeo[slug] ?? {
      title: `${slug.replaceAll("-", " ")} PDF tool`,
      description: "Ücretsiz PDF araçlarıyla dosyalarını tarayıcıda kolayca işle.",
      keywords: ["PDF tools", "ücretsiz PDF araçları"],
    };
    return {
      title: seo.title,
      description: seo.description,
      keywords: seo.keywords,
      alternates: { canonical: `/tools/${slug}` },
      openGraph: { title: seo.title, description: seo.description, url: `/tools/${slug}` },
    };
  });
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
