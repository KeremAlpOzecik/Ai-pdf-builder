import { getSiteUrl } from "@/lib/site-url";

export const SITE_NAME = "AI CV Builder";
export const SEO_UPDATED_AT = "2026-09-07";

export function absoluteUrl(path = "/") {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
