import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl } from "@/lib/seo";

const steps = [
  {
    title: "PDF, LinkedIn çıktısı veya boş form",
    body: "Mevcut özgeçmiş PDF’ini, ekran görüntüsünü yükle veya sıfırdan doldur. Hesap açmazsın.",
  },
  {
    title: "Alanları canlı önizlemede düzelt",
    body: "Unvan, tarih, iletişim ve maddeleri düzenle. Türkçe karakterler önizlemede görünür.",
  },
  {
    title: "ATS için önerileri seçerek uygula",
    body: "Yapay zekâ ifade önerir; her satırı kabul veya reddedebilirsin. Uydurma ölçü ekletme.",
  },
  {
    title: "PDF veya Word indir",
    body: "Metin katmanlı, başvuru sitelerine uygun dosyayı indir. İstersen PDF düzenleyiciyle son yazım hatasını düzelt.",
  },
];

export function StudioSeo() {
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "ATS uyumlu CV Türkçe ücretsiz nasıl hazırlanır?",
    description: "LinkedIn CV PDF’ini yükle, yazım hatasını düzelt, ATS uyumlu özgeçmiş indir.",
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      text: step.body,
    })),
  };

  return (
    <section className="border-t border-border/70 bg-background px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Ücretsiz yapay zekâ CV stüdyosu</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">
          LinkedIn CV PDF’ini yükle, ATS uyumlu Türkçe özgeçmiş indir
        </h2>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Kariyer.net ve LinkedIn başvuruları için sade, tek kolonlu, metni seçilebilir CV üret. Yazım hatası için
          PDF düzenleyiciye, evrak paketi için birleştirme aracına geçebilirsin.
        </p>
        <p className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-6 text-muted-foreground">
          Not: PDF veya ekran görüntüsü içe aktarma, ATS düzenleme ve çeviri özelliklerinde CV içeriği Google Gemini
          API’ye gönderilir. Ayrıntılar için <Link className="font-semibold underline" href="/privacy">gizlilik politikasına</Link> bak.
        </p>
        <ol className="mt-8 space-y-5">
          {steps.map((step, index) => (
            <li key={step.title}>
              <h3 className="text-lg font-semibold">
                {index + 1}. {step.title}
              </h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold">
          <Link className="text-primary underline underline-offset-4" href="/guides/ats-uyumlu-cv-turkce-ucretsiz">
            Türkçe ATS CV rehberi →
          </Link>
          <Link className="text-primary underline underline-offset-4" href="/guides/linkedin-cv-pdf-duzenleme">
            LinkedIn PDF rehberi →
          </Link>
          <Link className="text-primary underline underline-offset-4" href="/tools/edit-pdf">
            PDF’te yazım düzelt →
          </Link>
        </div>
      </div>
      <JsonLd data={howTo} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Ana sayfa", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: "CV stüdyosu", item: absoluteUrl("/studio") },
          ],
        }}
      />
    </section>
  );
}
