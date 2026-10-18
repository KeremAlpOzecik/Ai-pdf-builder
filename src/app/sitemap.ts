import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { guides } from "@/lib/guides";
import { TOOL_SLUGS } from "@/lib/tools";
import { SEO_UPDATED_AT } from "@/lib/seo";
import { toolSeo } from "@/lib/tool-seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const routes: Array<{ path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly"; updatedAt?: string }> = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/studio", priority: 0.9, changeFrequency: "weekly" },
    { path: "/guides", priority: 0.8, changeFrequency: "weekly", updatedAt: "2026-10-18" },
    { path: "/privacy", priority: 0.4, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
    ...TOOL_SLUGS.map((slug) => ({ path: `/tools/${slug}`, priority: 0.8, changeFrequency: "monthly" as const, updatedAt: toolSeo[slug].updatedAt })),
    ...guides.map((guide) => ({ path: `/guides/${guide.slug}`, priority: 0.7, changeFrequency: "monthly" as const, updatedAt: guide.updatedAt })),
  ];
  return routes.map((route) => ({
    url: `${baseUrl}${route.path === "/" ? "" : route.path}`,
    lastModified: new Date(`${route.updatedAt ?? SEO_UPDATED_AT}T00:00:00.000Z`),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
