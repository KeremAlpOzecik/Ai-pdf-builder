"use client";

import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { guides } from "@/lib/guides";
import { useDisplayLanguage } from "@/components/providers";

const faq = [
  {
    question: "PDF ücretsiz nasıl düzenlenir?",
    answer: "EkoPDF’de PDF düzenle aracını aç ve dosyanı seç. Yazı veya görsel ekleyebilir, hatalı alanı kapatıp üzerine doğru yazıyı yerleştirebilirsin. Sonucu PDF indir ile al. Hesap gerekmez; işlem tarayıcıda yapılır. Mevcut metin doğrudan değişmez ve kapatılan sayfalar görüntüye dönüşür.",
  },
  {
    question: "PDF dosyaları ücretsiz nasıl birleştirilir?",
    answer: "EkoPDF’nin PDF birleştir aracında dosyalarını seç, sıralarını düzenle ve birleştirme işlemini çalıştır. Birleştirilmiş PDF’i indir. Hesap gerekmez; dosyalar tarayıcıda işlenir.",
  },
  {
    question: "PDF ücretsiz Word’e nasıl çevrilir?",
    answer: "EkoPDF’nin PDF → Word aracına metin içeren PDF’ini yükle ve dönüştürme işlemini çalıştır. Metni düzenlenebilir DOCX olarak indir. Karmaşık sayfa düzenleri sadeleşebilir; taranmış görüntülerde önce OCR gerekebilir. Orijinal tasarımın birebir korunması garanti edilmez.",
  },
  {
    question: "PDF işlemleri ücretsiz mi?",
    answer:
      "Evet. PDF düzenleme, Word-PDF, birleştirme, OCR, imza, filigran, döndürme, sayfa numarası ve sıkıştırma ücretsiz. Günlük limit yok; hesap açmazsın.",
  },
  {
    question: "LinkedIn CV PDF’ini ücretsiz düzenleyebilir miyim?",
    answer:
      "Evet. PDF’i yükle, hatalı alanı kapatıp üzerine doğru yazıyı ekle. Eski metin doğrudan değişmez; kapatılan sayfa görüntüye dönüşür. ATS uyumu veya büyük revizyon için CV stüdyosunda yeniden oluştur.",
  },
  {
    question: "ATS uyumlu CV’yi Türkçe ve ücretsiz hazırlar mısınız?",
    answer:
      "Stüdyoda PDF veya ekran görüntüsü içe aktarılır; modern, klasik ve kompakt şablonlarla özgeçmiş hazırlanır. ATS için ifade önerilerini tek tek kabul edebilirsin.",
  },
  {
    question: "CV PDF yazım hatasını nasıl düzeltirim?",
    answer:
      "Alanı kapat ile eski yazının üstünü ört, Yazı ekle ile doğrusunu yerleştir ve PDF’i indir. Bu yöntem dijital ve taranmış PDF’lerde görsel düzeltme yapar. ATS için CV stüdyosunda seçilebilir metinli bir CV oluştur.",
  },
  {
    question: "Dosyalarım sunucuya yükleniyor mu?",
    answer:
      "Temel PDF araçları dosyayı tarayıcıda işler. CV içe aktarma, ATS düzenleme ve çeviri gibi yapay zekâ özelliklerinde CV içeriği, Google Gemini API’ye işlenmek üzere gönderilir.",
  },
  {
    question: "Hesap açmam gerekiyor mu?",
    answer: "Hayır. Ücretsiz PDF araçlarını ve CV stüdyosunu hesap açmadan kullanabilirsin.",
  },
];

export function SeoContent() {
  const tr = useDisplayLanguage() === "TR";
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  if (!tr) return (
    <>
      <section className="mx-auto mt-16 max-w-7xl border-t border-border/70 px-5 py-12 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Free PDF tools · ATS CV</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Edit documents in your browser and download an ATS-ready resume</h2>
        <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">Merge, split, compress, rotate, sign, watermark, convert, and OCR PDF files without an account. Core PDF tools process files locally in your browser. AI import, ATS suggestions, and translation send CV content to Google Gemini.</p>
        <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold"><Link className="underline" href="/studio">Open CV studio →</Link><Link className="underline" href="/tools/edit-pdf">Open PDF editor →</Link><Link className="underline" href="/guides">View guides →</Link></div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">FAQ</p><h2 className="mt-3 text-3xl font-semibold">Frequently asked questions</h2><div className="mt-8 grid gap-4 md:grid-cols-2">{[
        ["Are the PDF tools free?", "Yes. No account or daily limit is required."],
        ["Can I edit a LinkedIn resume PDF?", "Yes. Use the PDF editor for small corrections or import it into the CV studio for larger changes."],
        ["Are my files uploaded?", "Core PDF tools run locally. AI features send CV content to Google Gemini for processing."],
        ["Does ATS optimization change my CV automatically?", "No. You review and approve each suggestion."],
      ].map(([question, answer]) => <details key={question} className="rounded-2xl border bg-card p-5"><summary className="cursor-pointer font-semibold">{question}</summary><p className="mt-3 text-sm text-muted-foreground">{answer}</p></details>)}</div></section>
      <section className="mx-auto max-w-7xl border-t px-5 py-14 sm:px-8"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">PDF and CV guides</p><h2 className="mt-3 text-3xl font-semibold">Practical document guides</h2><Link className="mt-6 inline-block font-semibold underline" href="/guides">Browse all guides →</Link></section>
    </>
  );

  return (
    <>
      <section className="mx-auto mt-16 max-w-7xl border-t border-border/70 px-5 pt-12 sm:px-8 lg:mt-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Ücretsiz PDF araçları · ATS CV
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              LinkedIn özgeçmişini tarayıcıda düzelt, ATS uyumlu Türkçe CV indir
            </h2>
          </div>
          <div className="space-y-5 text-base leading-7 text-muted-foreground">
            <p>
              EkoPDF; PDF düzenleme, Word dönüşümü, birleştirme, sıkıştırma, OCR, imza, filigran, döndürme ve
              sayfa numarası sunar. Bu araçları ücretsiz ve hesap açmadan kullanabilirsin:
              dosyanı seç, işlemi çalıştır, sonucu indir. Bu temel araçlarda dosyan sunucuya yüklenmez.
            </p>
            <p>
              CV stüdyosunda LinkedIn PDF’ini veya ekran görüntünü içe aktar, yazım hatasını düzelt ve ATS için ifade
              önerisi al. Yapay zekâ özelliklerinde CV içeriği Google Gemini API’ye gönderilir; ayrıntılar için gizlilik
              politikasını inceleyebilirsin.
            </p>
            <div className="flex flex-wrap gap-3 text-sm font-semibold text-foreground">
              <Link className="underline decoration-primary/40 underline-offset-4" href="/studio">
                AI CV stüdyosunu aç →
              </Link>
              <Link className="underline decoration-primary/40 underline-offset-4" href="/tools/edit-pdf">
                PDF düzenleyiciyi aç →
              </Link>
              <Link className="underline decoration-primary/40 underline-offset-4" href="/guides">
                Tüm rehberler →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20" aria-labelledby="faq-title">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">SSS</p>
          <h2 id="faq-title" className="mt-3 text-3xl font-semibold tracking-tight">
            Sık sorulan sorular
          </h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {faq.map((item) => (
            <details key={item.question} className="rounded-2xl border border-border/70 bg-card p-5">
              <summary className="cursor-pointer font-semibold">{item.question}</summary>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl border-t border-border/70 px-5 py-14 sm:px-8" aria-labelledby="guides-title">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">PDF ve CV rehberleri</p>
        <h2 id="guides-title" className="mt-3 text-3xl font-semibold tracking-tight">
          LinkedIn CV, yazım hatası ve ücretsiz PDF işlemleri
        </h2>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="rounded-2xl border border-border/70 bg-card p-5 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-primary/40"
            >
              {guide.title} <span className="ml-1 text-primary">→</span>
            </Link>
          ))}
        </div>
      </section>
      <JsonLd data={faqSchema} />
    </>
  );
}
