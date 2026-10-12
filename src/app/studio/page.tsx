import { pageMetadata } from "@/lib/seo";
import { Dashboard } from "@/components/dashboard";
import { StudioSeo } from "@/components/seo/studio-seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "sade CV oluştur | Cihazında çalışan CV stüdyosu",
  description:
    "PDF veya görselleri cihazında OCR ile içe aktar. Taslağı kontrol et, Türkçe veya İngilizce CV hazırla ve PDF veya Word indir.",
  keywords: [
    "sade Türkçe CV şablonları",
    "OCR CV içe aktarma",
    "linkedin cv pdf düzenle",
    "ücretsiz özgeçmiş hazırlama",
  ],
  path: "/studio",
});

export default function StudioPage() {
  return (
    <>
      <Dashboard />
      <StudioSeo />
    </>
  );
}
