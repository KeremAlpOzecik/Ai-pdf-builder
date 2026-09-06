import { ToolsHub } from "@/components/tools/tools-hub";
import { SeoContent } from "@/components/seo/seo-content";

export const metadata = {
  title: "Ücretsiz PDF Araçları ve Yapay Zekâ CV Oluşturucu",
  description:
    "PDF düzenle, Word-PDF dönüştür, PDF birleştir veya sıkıştır. CV’ni yapay zekâ ile güncelle ve ATS için hazırla.",
  keywords: [
    "ücretsiz PDF araçları",
    "PDF düzenleme",
    "PDF Word dönüştürme",
    "yapay zekâ CV oluşturucu",
    "ATS uyumlu CV",
    "free PDF tools",
    "AI resume builder",
  ],
};

export default function Home() {
  return (
    <>
      <ToolsHub />
      <SeoContent />
    </>
  );
}
