const productionUrl = "https://ai-pdf-builder.vercel.app";

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured || configured.includes("localhost")) return productionUrl;
  return configured.replace(/\/$/, "");
}
