import Link from "next/link";

const faq = [
  {
    question: "PDF işlemleri ücretsiz mi?",
    answer:
      "Evet. PDF düzenleme, Word-PDF dönüşümü, birleştirme, bölme, sıkıştırma ve JPG-PDF işlemleri ücretsiz kullanılabilir.",
  },
  {
    question: "CV’mi yapay zeka ile güncelleyebilir miyim?",
    answer:
      "Evet. CV PDF’inizi veya ekran görüntünüzü yükleyebilir, alanları düzenleyebilir ve ATS için daha güçlü ifade önerileri alabilirsiniz.",
  },
  {
    question: "Dosyalarım sunucuya yükleniyor mu?",
    answer:
      "Tarayıcıdaki PDF araçları dosyalarınızı cihazınızda işler. CV içeriğini yapay zeka ile analiz ettirdiğiniz akışlarda dosya, ilgili API işlemine gönderilir.",
  },
  {
    question: "Hesap açmam gerekiyor mu?",
    answer: "Hayır. Ücretsiz PDF araçlarını ve CV stüdyosunu hesap açmadan deneyebilirsiniz.",
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
              Ücretsiz PDF araçları · Free PDF tools
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              PDF işlemleri ve yapay zekâ destekli CV düzenleme tek yerde
            </h2>
          </div>
          <div className="space-y-5 text-base leading-7 text-muted-foreground">
            <p>
              AI CV Builder; PDF düzenleme, PDF’i Word’e çevirme, Word dosyasını PDF yapma,
              PDF birleştirme, sayfa bölme, sıkıştırma ve JPG-PDF dönüşümü için ücretsiz online
              araçlar sunar. Hesap açmadan dosyanı seç, işlemi çalıştır ve sonucu indir.
            </p>
            <p>
              CV stüdyosunda mevcut özgeçmiş PDF’ini veya CV ekran görüntünü içe aktarabilir,
              bilgilerini canlı önizlemede düzenleyebilir ve yapay zekâdan ATS uyumlu ifade
              önerileri alabilirsin. English: build, edit and improve your resume with free PDF
              tools and an AI-powered CV studio.
            </p>
            <div className="flex flex-wrap gap-3 text-sm font-semibold text-foreground">
              <Link className="underline decoration-primary/40 underline-offset-4" href="/studio">
                AI CV stüdyosunu aç →
              </Link>
              <Link className="underline decoration-primary/40 underline-offset-4" href="/tools/edit-pdf">
                PDF düzenleyiciyi aç →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20" aria-labelledby="faq-title">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">FAQ</p>
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
        <h2 id="guides-title" className="mt-3 text-3xl font-semibold tracking-tight">Dosyalarını daha iyi hazırlamak için kısa rehberler</h2>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {[
            ["/guides/ucretsiz-pdf-birlestirme", "Ücretsiz PDF birleştirme nasıl yapılır?"],
            ["/guides/pdf-word-cevirme", "PDF’i Word’e ücretsiz çevirme"],
            ["/guides/ats-uyumlu-cv-olusturma", "ATS uyumlu CV nasıl oluşturulur?"],
            ["/guides/cv-pdf-duzenleme", "CV PDF dosyası nasıl düzenlenir?"],
            ["/guides/pdf-sikistirma", "PDF dosya boyutu nasıl küçültülür?"],
          ].map(([href, title]) => (
            <Link key={href} href={href} className="rounded-2xl border border-border/70 bg-card p-5 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-primary/40">
              {title} <span className="ml-1 text-primary">→</span>
            </Link>
          ))}
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  );
}
