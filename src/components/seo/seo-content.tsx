import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { guides } from "@/lib/guides";

const faq = [
  {
    question: "PDF işlemleri ücretsiz mi?",
    answer:
      "Evet. PDF düzenleme, Word-PDF dönüşümü, birleştirme, bölme, sıkıştırma ve JPG-PDF işlemleri ücretsiz. Hesap açmazsın.",
  },
  {
    question: "LinkedIn CV PDF’ini ücretsiz düzenleyebilir miyim?",
    answer:
      "Evet. LinkedIn’den indirdiğin dijital PDF’i düzenleyiciye yükle, yazım hatası veya tarihi yerinde değiştir. Büyük revizyon için stüdyoya aktar.",
  },
  {
    question: "ATS uyumlu CV’yi Türkçe ve ücretsiz hazırlar mısınız?",
    answer:
      "Stüdyoda PDF veya ekran görüntüsü içe aktarılır, sade tek kolonlu özgeçmiş üretilir. ATS için ifade önerilerini tek tek kabul edebilirsin.",
  },
  {
    question: "CV PDF yazım hatasını nasıl düzeltirim?",
    answer:
      "Seçilebilir metinli dosyada satıra tıklayıp düzelt, yeni PDF indir. Taranmış görüntüyse stüdyoya ekran görüntüsü yükle.",
  },
  {
    question: "Dosyalarım sunucuya yükleniyor mu?",
    answer:
      "Tarayıcıdaki PDF araçları dosyayı cihazında işler. Yapay zekâ analizi kullandığın stüdyo akışında içerik ilgili API’ye gider.",
  },
  {
    question: "Hesap açmam gerekiyor mu?",
    answer: "Hayır. Ücretsiz PDF araçlarını ve CV stüdyosunu hesap açmadan kullanabilirsin.",
  },
];

export function SeoContent() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

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
              AI CV Builder; PDF düzenleme, PDF’i Word’e çevirme, Word’ü PDF yapma, birleştirme, bölme, sıkıştırma ve
              JPG-PDF dönüşümü sunar. Hesap açmadan dosyanı seç, işlemi çalıştır, sonucu indir.
            </p>
            <p>
              CV stüdyosunda LinkedIn PDF’ini veya ekran görüntünü içe aktar, yazım hatasını düzelt ve ATS için ifade
              önerisi al. Dosya tarayıcıda kalır; büyük revizyonu satır tıklayarak yapmak zorunda değilsin.
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
