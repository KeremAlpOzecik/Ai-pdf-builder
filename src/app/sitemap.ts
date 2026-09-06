import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const routes = ["/", "/studio", "/tools/edit-pdf", "/tools/word-to-pdf", "/tools/pdf-to-word", "/tools/merge", "/tools/split", "/tools/compress", "/tools/jpg-pdf"];
  return routes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/studio" ? 0.9 : 0.7,
  }));
}
