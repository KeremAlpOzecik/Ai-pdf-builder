import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

export const SITE_NAME = "AI CV Builder";
export const SEO_UPDATED_AT = "2026-09-08";

// Next.js replaces nested metadata instead of merging it. Every page must
// include the shared image, locale and card settings when defining its own SEO.
export function pageMetadata({
  title,
  description,
  path,
  keywords,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  type?: "website" | "article";
}): Metadata {
  const image = {
    url: absoluteUrl("/opengraph-image"),
    width: 1200,
    height: 630,
    alt: "Ücretsiz PDF düzenle ve ATS uyumlu CV oluştur",
  };
  return {
    title,
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type,
      siteName: SITE_NAME,
      locale: "tr_TR",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export function absoluteUrl(path = "/") {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
