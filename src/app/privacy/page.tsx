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
          <p className="leading-7 font-medium">AI ile CV içe aktarma, ATS iyileştirme ve çeviri şu anda geçici olarak kapalıdır. Bu özellikler üzerinden yeni CV içeriği sağlayıcılara gönderilmez. Aşağıdaki AI açıklamaları, önceki kullanım ve yeniden açılması halinde uygulanacak veri akışını anlatır.</p>
          <p className="leading-7 text-muted-foreground">EkoPDF, temel PDF işlemlerini tarayıcında yapar. CV içe aktarma, ATS düzenleme ve çeviri gibi isteğe bağlı AI özellikleri CV metnini veya görsellerini Vercel üzerinde çalışan sunucumuz üzerinden Groq API’ye gönderir.</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Tarayıcıda çalışan işlemler</h2>
          <p className="leading-7 text-muted-foreground">Düzenleme, birleştirme, bölme, sıkıştırma, OCR, imza, filigran, döndürme, sayfa numarası ve görsel/PDF dönüşümlerinin temel işlemleri cihazındaki tarayıcıda gerçekleştirilir. Bu işlemlerde seçtiğin dosyanın içeriğini kendi sunucumuza yüklemeyiz.</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">AI özellikleri ve hizmet sağlayıcıları</h2>
          <p className="leading-7 text-muted-foreground">Metinli PDF’den çıkarılan CV metni, taranmış PDF’nin tarayıcıda oluşturulan sayfa görselleri veya yüklediğin CV görselleri içe aktarma için Groq’a gönderilir. ATS düzenleme ve çeviri için CV alanları gönderilir. Google Gemini kullanılmaz.</p>
          <p className="leading-7 text-muted-foreground">AI özelliğini kullanarak bu aktarımı başlatmış olursun. Kimlik numarası, banka bilgisi, sağlık bilgisi veya paylaşmak istemediğin başka hassas verileri yükleme.</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Paylaşılan bilgiler ve işleme amacı</h2>
          <p className="leading-7 text-muted-foreground">AI ile içe aktarmada CV metni veya görselleri; ATS önerilerinde ve çeviride CV alanları paylaşılır. Bunlar ad, iletişim bilgileri, iş deneyimi, eğitim, beceriler ve CV’ye eklediğin diğer bilgileri içerebilir. Amaç yalnızca seçtiğin içe aktarma, ifade önerisi veya çeviri işlemini gerçekleştirmektir.</p>
          <p className="leading-7 text-muted-foreground">AI kullanımı isteğe bağlıdır. AI isteği göndermeden manuel düzenleme ve indirme yapabilirsin. Sağlayıcıların altyapıları nedeniyle içerik Türkiye dışında işlenebilir. Bu açıklama, gereken hukuki dayanak veya yurt dışı aktarım yükümlülüklerinin yerine geçtiği anlamına gelmez.</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Sağlayıcıların veri koşulları</h2>
          <p className="leading-7 text-muted-foreground">Groq, açıkça izin verilmedikçe API girdilerini ve çıktılarını model eğitimi için kullanmadığını belirtir. EkoPDF’nin Groq hesabında Inference APIs Zero Data Retention ayarı etkindir; bu ayar, API girdileri ve çıktılarının hizmet güvenilirliği ve kötüye kullanım incelemesi amacıyla saklanmasını devre dışı bırakır. İsteğin yerine getirilmesi sırasında içerik yine işlenir. İstek metaverileri ve kanuni zorunluluklar bu ayardan ayrı değerlendirilir; tüm teknik kayıtların hiç tutulmadığını iddia etmiyoruz.</p>
          <p className="leading-7 text-muted-foreground"><a href="https://console.groq.com/docs/your-data" target="_blank" rel="noopener noreferrer" className="underline">Groq veri işleme açıklaması</a></p>
        </section>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Tarayıcı depolaması</h2>
          <p className="leading-7 text-muted-foreground">Düzenlediğin CV ve PDF editörünün son taslağı, kaldığın yerden devam edebilmen için tarayıcının yerel depolamasında tutulabilir. PDF taslağı aynı tarayıcıda “Düzenlemeye devam et” ile açılabilir, “Taslağı sil” ile kaldırılabilir. Bu veri sunucumuza gönderilmez; ortak veya herkese açık bir cihaz kullanıyorsan işlem bitince veriyi ve indirilen dosyaları temizle.</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Analitik ve teknik veriler</h2>
          <p className="leading-7 text-muted-foreground">Ziyaretçi sayısını ve sayfa görüntülemelerini ölçmek için Vercel Web Analytics kullanılır. Analitik takibine PDF veya CV içerikleri gönderilmez. Vercel, barındırma sağlayıcımız olarak AI isteklerini karşılamak için gönderilen CV içeriğini geçici olarak işler. Barındırma ve güvenlik hizmetleri IP adresi ve istek bilgileri gibi teknik verileri de işleyebilir. CV içeriğini uygulama günlüklerine yazmayız ve sunucuda bir CV veritabanına kaydetmeyiz.</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Haklar ve iletişim</h2>
          <p className="leading-7 text-muted-foreground">EkoPDF, Kerem Alp Ozecik tarafından bireysel olarak işletilir. Kişisel verilerinin işlenmesi, paylaşımı, düzeltilmesi veya silinmesiyle ilgili sorular ve talepler için <a href="mailto:keremalpozecik@gmail.com" className="underline">keremalpozecik@gmail.com</a> adresine yazabilirsin. KVKK kapsamında verilerinin işlenip işlenmediğini öğrenme, işlenmişse bilgi isteme, işleme amacını ve amaca uygun kullanımını öğrenme, yurt içinde veya dışında aktarıldığı üçüncü kişileri öğrenme, eksik veya yanlış verilerin düzeltilmesini isteme, kanundaki koşullarda silinmesini veya yok edilmesini isteme ve bu işlemlerin alıcılara bildirilmesini isteme hakların bulunur. Ayrıca yalnızca otomatik analiz sonucu aleyhine çıkan bir sonuca itiraz edebilir ve kanuna aykırı işleme nedeniyle zararın giderilmesini talep edebilirsin. Başvurular en kısa sürede, en geç 30 gün içinde yanıtlanır. Gerekli durumlarda talepler ilgili sağlayıcılara iletilir; yasal saklama zorunlulukları yanıtımızda açıklanır. Politika değişirse bu sayfadaki güncelleme tarihi yenilenir.</p>
        </section>
      </article>
    </main>
  );
}
