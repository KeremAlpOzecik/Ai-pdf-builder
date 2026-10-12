import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
  title: "Gizlilik politikası",
  description: "EkoPDF’da PDF araçları, CV verileri, yerel OCR ve teknik veri kullanımı hakkında açıklama.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-20">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">← Ana sayfa</Link>
      <article className="mt-10 space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Şeffaflık</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Gizlilik politikası</h1>
          <p className="mt-4 text-sm text-muted-foreground">Son güncelleme: 12 Ekim 2026</p>
        </div>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Kısa özet</h2>
          <p className="leading-7 text-muted-foreground">CV içe aktarma ve temel PDF işlemleri cihazındaki tarayıcıda çalışır. PDF, JPEG, PNG ve WebP içerikleri sunucumuza veya AI sağlayıcılarına gönderilmez. Bulut AI, otomatik çeviri ve ifade önerileri kaldırılmıştır.</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Tarayıcıda çalışan işlemler</h2>
          <p className="leading-7 text-muted-foreground">CV içe aktarmada seçilebilir PDF metni doğrudan okunur; görseller ve taranmış sayfalar Türkçe/İngilizce OCR ile cihazda işlenir. OCR yazılımı ve dil dosyaları sitemizden indirilir. Sonuçlar hatalı olabilir; indirirken tüm alanları kontrol et. Çıkarılan kaynak metin yalnızca açık oturumda tutulur.</p>
          <p className="leading-7 text-muted-foreground">Düzenleme, birleştirme, bölme, sıkıştırma, OCR, imza, filigran, döndürme, sayfa numarası ve görsel/PDF dönüşümlerinin temel işlemleri cihazındaki tarayıcıda gerçekleştirilir. Bu işlemlerde seçtiğin dosyanın içeriğini kendi sunucumuza yüklemeyiz.</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Tarayıcı depolaması</h2>
          <p className="leading-7 text-muted-foreground">Düzenlediğin CV ve PDF editörünün son taslağı, kaldığın yerden devam edebilmen için tarayıcının yerel depolamasında tutulabilir. PDF taslağı aynı tarayıcıda “Düzenlemeye devam et” ile açılabilir, “Taslağı sil” ile kaldırılabilir. Bu veri sunucumuza gönderilmez; ortak veya herkese açık bir cihaz kullanıyorsan işlem bitince veriyi ve indirilen dosyaları temizle.</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Analitik ve teknik veriler</h2>
          <p className="leading-7 text-muted-foreground">Vercel Web Analytics ziyaretçi ve sayfa görüntüleme ölçümü için kullanılır. PDF/CV içeriklerini ve çıkarılan metni analitiğe göndermeyiz. Vercel barındırma ve güvenlik için IP adresi ve istek bilgileri gibi teknik verileri işleyebilir; cihazda dosya işlenmesi bu teknik veri akışını ortadan kaldırmaz.</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Haklar ve iletişim</h2>
          <p className="leading-7 text-muted-foreground">EkoPDF, Kerem Alp Ozecik tarafından bireysel olarak işletilir. Kişisel verilerinin işlenmesi, paylaşımı, düzeltilmesi veya silinmesiyle ilgili sorular ve talepler için <a href="mailto:keremalpozecik@gmail.com" className="underline">keremalpozecik@gmail.com</a> adresine yazabilirsin. KVKK kapsamında verilerinin işlenip işlenmediğini öğrenme, işlenmişse bilgi isteme, işleme amacını ve amaca uygun kullanımını öğrenme, yurt içinde veya dışında aktarıldığı üçüncü kişileri öğrenme, eksik veya yanlış verilerin düzeltilmesini isteme, kanundaki koşullarda silinmesini veya yok edilmesini isteme ve bu işlemlerin alıcılara bildirilmesini isteme hakların bulunur. Ayrıca yalnızca otomatik analiz sonucu aleyhine çıkan bir sonuca itiraz edebilir ve kanuna aykırı işleme nedeniyle zararın giderilmesini talep edebilirsin. Başvurular en kısa sürede, en geç 30 gün içinde yanıtlanır. Gerekli durumlarda talepler ilgili sağlayıcılara iletilir; yasal saklama zorunlulukları yanıtımızda açıklanır. Politika değişirse bu sayfadaki güncelleme tarihi yenilenir.</p>
        </section>
      </article>
    </main>
  );
}
