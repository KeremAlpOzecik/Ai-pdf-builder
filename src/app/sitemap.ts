import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { guides } from "@/lib/guides";
import { TOOL_SLUGS } from "@/lib/tools";
import { SEO_UPDATED_AT } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const lastModified = new Date(`${SEO_UPDATED_AT}T00:00:00.000Z`);
  const routes: Array<{ path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }> = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/studio", priority: 0.9, changeFrequency: "weekly" },
    { path: "/guides", priority: 0.8, changeFrequency: "weekly" },
    { path: "/privacy", priority: 0.4, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
    ...TOOL_SLUGS.map((slug) => ({ path: `/tools/${slug}`, priority: 0.8, changeFrequency: "monthly" as const })),
    ...guides.map((guide) => ({ path: `/guides/${guide.slug}`, priority: 0.7, changeFrequency: "monthly" as const })),
  ];
  return routes.map((route) => ({
    url: `${baseUrl}${route.path === "/" ? "" : route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
