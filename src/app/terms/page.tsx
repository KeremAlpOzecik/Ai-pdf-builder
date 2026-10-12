import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
  title: "Kullanım şartları",
  description: "EkoPDF PDF araçları ve CV içe aktarma için kullanım şartları.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-20">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">← Ana sayfa</Link>
      <article className="mt-10 space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Kurallar</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Kullanım şartları</h1>
          <p className="mt-4 text-sm text-muted-foreground">Son güncelleme: 12 Ekim 2026</p>
        </div>
        <section className="space-y-3"><h2 className="text-2xl font-semibold">Hizmet</h2><p className="leading-7 text-muted-foreground">EkoPDF, PDF işlemleri ve CV hazırlama araçlarını ücretsiz olarak sunar. Hizmet hesap açmadan kullanılabilir; özellikler ve limitler önceden haber verilerek değiştirilebilir.</p></section>
        <section className="space-y-3"><h2 className="text-2xl font-semibold">Kullanıcının sorumluluğu</h2><p className="leading-7 text-muted-foreground">Yüklediğin dosyalar ve oluşturduğun içerik için gerekli haklara sahip olmalısın. OCR ve otomatik alan eşleştirme hatalı veya eksik olabilir; başvuru göndermeden önce CV’ni ve tüm kişisel bilgileri kontrol et. Kaynak belgede olmayan bilgileri ekleme.</p></section>
        <section className="space-y-3"><h2 className="text-2xl font-semibold">Yerel CV içe aktarma</h2><p className="leading-7 text-muted-foreground">PDF ve görseller cihazında okunur. Form alanları kontrol etmen gereken bir taslak olarak doldurulur. Otomatik çeviri veya bulut AI önerileri sunulmaz. Karmaşık tasarımlar, düşük çözünürlük ve bölüm sırası hatalı eşleşmelere yol açabilir.</p></section>
        <section className="space-y-3"><h2 className="text-2xl font-semibold">Garanti ve sorumluluk sınırı</h2><p className="leading-7 text-muted-foreground">Dosya dönüşümleri ve OCR çıktıları her belge veya kullanım senaryosunda kusursuz çalışmayabilir. Önemli belgelerin orijinalini sakla ve sonuçları kullanmadan önce kontrol et.</p></section>
      </article>
    </main>
  );
}
