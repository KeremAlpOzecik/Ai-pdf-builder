import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.woff": { type: "asset" },
      "*.woff2": { type: "asset" },
    },
  },
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "tesseract.js"],
  poweredByHeader: false,
  async redirects() {
    return [{ source: "/tools/edit-pdf", destination: "/tools/workspace", permanent: true }];
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }];
  },
};

export default nextConfig;
