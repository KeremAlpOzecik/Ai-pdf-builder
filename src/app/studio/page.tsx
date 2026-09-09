import { pageMetadata } from "@/lib/seo";
import { Dashboard } from "@/components/dashboard";
import { StudioSeo } from "@/components/seo/studio-seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "ATS uyumlu CV oluştur | Ücretsiz yapay zekâ stüdyosu",
  description:
    "LinkedIn CV PDF’ini içe aktar, Türkçe veya İngilizce özgeçmiş hazırla. AI önerilerini incele, PDF veya Word indir. Hesap gerekmez.",
  keywords: [
    "ATS uyumlu CV Türkçe ücretsiz",
    "yapay zekâ CV oluşturucu",
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
