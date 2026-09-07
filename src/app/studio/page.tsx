import { Dashboard } from "@/components/dashboard";
import { StudioSeo } from "@/components/seo/studio-seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ATS uyumlu CV oluştur | Ücretsiz yapay zekâ stüdyosu",
  description:
    "LinkedIn CV PDF’ini yükle, yazım hatasını düzelt, ATS uyumlu Türkçe özgeçmiş indir. Hesap yok, tarayıcıda çalışır.",
  keywords: [
    "ATS uyumlu CV Türkçe ücretsiz",
    "yapay zekâ CV oluşturucu",
    "linkedin cv pdf düzenle",
    "ücretsiz özgeçmiş hazırlama",
  ],
  alternates: { canonical: "/studio" },
  openGraph: {
    title: "ATS uyumlu CV oluştur | Ücretsiz yapay zekâ stüdyosu",
    description: "LinkedIn özgeçmişini yükle, ATS için düzenle, PDF veya Word indir.",
    url: "/studio",
  },
};

export default function StudioPage() {
  return (
    <>
      <Dashboard />
      <StudioSeo />
    </>
  );
}
