import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kullanım şartları",
  description: "AI CV Builder PDF araçları ve AI özellikleri için kullanım şartları.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-20">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">← Ana sayfa</Link>
      <article className="mt-10 space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Kurallar</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Kullanım şartları</h1>
          <p className="mt-4 text-sm text-muted-foreground">Son güncelleme: 9 Eylül 2026</p>
        </div>
        <section className="space-y-3"><h2 className="text-2xl font-semibold">Hizmet</h2><p className="leading-7 text-muted-foreground">AI CV Builder, PDF işlemleri ve CV hazırlama araçlarını ücretsiz olarak sunar. Hizmet hesap açmadan kullanılabilir; özellikler ve limitler önceden haber verilerek değiştirilebilir.</p></section>
        <section className="space-y-3"><h2 className="text-2xl font-semibold">Kullanıcının sorumluluğu</h2><p className="leading-7 text-muted-foreground">Yüklediğin dosyalar ve oluşturduğun içerik için gerekli haklara sahip olmalısın. AI önerileri hatalı veya eksik olabilir; başvuru göndermeden önce CV’ni ve tüm kişisel bilgileri kontrol et. AI tarafından uydurulmuş bilgi ekleme.</p></section>
        <section className="space-y-3"><h2 className="text-2xl font-semibold">AI özellikleri</h2><p className="leading-7 text-muted-foreground">AI özellikleri Google Gemini API gibi üçüncü taraf hizmetlere ihtiyaç duyabilir. Bu özellikleri kullanırken verinin ilgili sağlayıcıya aktarılabileceğini kabul edersin. Ayrıntılar için <Link href="/privacy" className="underline">gizlilik politikasını</Link> incele.</p></section>
        <section className="space-y-3"><h2 className="text-2xl font-semibold">Garanti ve sorumluluk sınırı</h2><p className="leading-7 text-muted-foreground">Dosya dönüşümleri ve AI çıktıları her belge veya kullanım senaryosunda kusursuz çalışmayabilir. Önemli belgelerin orijinalini sakla ve sonuçları kullanmadan önce kontrol et.</p></section>
      </article>
    </main>
  );
}
