const productionUrl = "https://ekopdf.com";

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured || configured.includes("localhost")) return productionUrl;
  return configured.replace(/\/$/, "");
}
