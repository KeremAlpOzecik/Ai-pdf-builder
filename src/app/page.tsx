import { pageMetadata } from "@/lib/seo";
import { ToolsHub } from "@/components/tools/tools-hub";
import { SeoContent } from "@/components/seo/seo-content";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Ücretsiz PDF düzenle ve ATS uyumlu CV oluştur",
  description:
    "LinkedIn CV PDF’ini düzenle, yazım hatasını düzelt, Word çevir veya birleştir. Temel PDF araçları tarayıcıda çalışır; ATS AI özellikleri Gemini API kullanır.",
  keywords: [
    "ücretsiz PDF düzenle",
    "linkedin cv pdf düzenle ücretsiz",
    "ATS uyumlu CV Türkçe ücretsiz",
    "cv pdf yazım hatası düzelt",
    "yapay zekâ CV oluşturucu",
    "PDF Word çevirme",
  ],
  path: "/",
});

export default function Home() {
  return (
    <>
      <ToolsHub />
      <SeoContent />
    </>
  );
}
