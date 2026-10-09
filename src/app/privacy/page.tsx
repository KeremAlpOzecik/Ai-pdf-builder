import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
  title: "Gizlilik politikası",
  description: "EkoPDF’da PDF araçları, CV verileri, AI özellikleri ve analitik kullanımı hakkında açıklama.",
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
          <p className="mt-4 text-sm text-muted-foreground">Son güncelleme: 9 Ekim 2026</p>
        </div>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Kısa özet</h2>
          <p className="leading-7 text-muted-foreground">EkoPDF, temel PDF işlemlerini tarayıcında yapar. CV içe aktarma, ATS düzenleme ve çeviri gibi AI özellikleri çalışabilmek için içeriği sunucumuz üzerinden Google Gemini API’ye gönderir. ATS önerilerinde Gemini kullanılamazsa Groq yedek sağlayıcı olarak kullanılabilir.</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Tarayıcıda çalışan işlemler</h2>
          <p className="leading-7 text-muted-foreground">Düzenleme, birleştirme, bölme, sıkıştırma, OCR, imza, filigran, döndürme, sayfa numarası ve görsel/PDF dönüşümlerinin temel işlemleri cihazındaki tarayıcıda gerçekleştirilir. Bu işlemlerde seçtiğin dosyanın içeriğini kendi sunucumuza yüklemeyiz.</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">AI özellikleri ve hizmet sağlayıcıları</h2>
          <p className="leading-7 text-muted-foreground">PDF veya görselden CV çıkarma, ATS düzenleme ve çeviri sırasında CV metni, CV JSON verisi veya görsel/PDF içeriği Google Gemini API’ye gönderilebilir. ATS önerilerinde Gemini yoğunluk, kota veya bağlantı hatası verirse CV JSON verisi Groq API’ye gönderilebilir. Groq, PDF veya görsel içe aktarma için kullanılmaz. Groq’un veri işleme ve saklama koşulları bu yedek işlemlerde geçerlidir. Google’ın ilgili API hesabı ve kullanım katmanı için geçerli veri işleme, saklama ve model geliştirme koşulları uygulanır. Ücretsiz API kullanımında içeriklerin ürünleri geliştirmek için kullanılabileceğini varsayarak hassas bilgi yüklememeni öneririz.</p>
          <p className="leading-7 text-muted-foreground">AI özelliğini kullanarak bu aktarımı başlatmış olursun. Kimlik numarası, banka bilgisi, sağlık bilgisi veya paylaşmak istemediğin başka hassas verileri yükleme.</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Tarayıcı depolaması</h2>
          <p className="leading-7 text-muted-foreground">Düzenlediğin CV ve PDF editörünün son taslağı, kaldığın yerden devam edebilmen için tarayıcının yerel depolamasında tutulabilir. PDF taslağı aynı tarayıcıda “Düzenlemeye devam et” ile açılabilir, “Taslağı sil” ile kaldırılabilir. Bu veri sunucumuza gönderilmez; ortak veya herkese açık bir cihaz kullanıyorsan işlem bitince veriyi ve indirilen dosyaları temizle.</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Analitik ve teknik veriler</h2>
          <p className="leading-7 text-muted-foreground">Ziyaretçi sayısını ve sayfa görüntülemelerini ölçmek için Vercel Web Analytics kullanılır. Analitik takibine PDF veya CV içerikleri gönderilmez. Barındırma ve güvenlik hizmetleri siteyi sunmak ve istekleri karşılamak için teknik verileri işleyebilir.</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Haklar ve iletişim</h2>
          <p className="leading-7 text-muted-foreground">Bu metin uygulamanın mevcut veri akışını açıklar; resmi hukuki danışmanlık değildir. Veri talepleri veya politika soruları için uygulama sahibine ulaşılabilir. Politika değişirse bu sayfadaki güncelleme tarihi yenilenir.</p>
        </section>
      </article>
    </main>
  );
}
