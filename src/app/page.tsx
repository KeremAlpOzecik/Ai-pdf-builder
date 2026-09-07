import { ToolsHub } from "@/components/tools/tools-hub";
import { SeoContent } from "@/components/seo/seo-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ücretsiz PDF düzenle ve ATS uyumlu CV oluştur",
  description:
    "LinkedIn CV PDF’ini tarayıcıda düzenle, yazım hatasını düzelt, Word çevir veya birleştir. ATS uyumlu Türkçe özgeçmiş indir. Hesap yok.",
  keywords: [
    "ücretsiz PDF düzenle",
    "linkedin cv pdf düzenle ücretsiz",
    "ATS uyumlu CV Türkçe ücretsiz",
    "cv pdf yazım hatası düzelt",
    "yapay zekâ CV oluşturucu",
    "PDF Word çevirme",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Ücretsiz PDF düzenle ve ATS uyumlu CV oluştur",
    description: "LinkedIn özgeçmişini tarayıcıda düzelt. Hesap yok, dosya sende kalır.",
    url: "/",
  },
};

export default function Home() {
  return (
    <>
      <ToolsHub />
      <SeoContent />
    </>
  );
}
