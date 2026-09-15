"use client";

import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl } from "@/lib/seo";
import { getToolSeo } from "@/lib/tool-seo";
import { useDisplayLanguage } from "@/components/providers";

export function ToolArticle({ slug }: { slug: string }) {
  const seo = getToolSeo(slug);
  const tr = useDisplayLanguage() === "TR";
  if (!seo) return null;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: seo.faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: seo.h1,
    description: seo.description,
    step: seo.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      text: step.body,
    })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ücretsiz PDF araçları", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: seo.h1, item: absoluteUrl(`/tools/${slug}`) },
    ],
  };

  return (
    <section className="mx-auto w-full max-w-3xl px-6 pb-16">
      <p className="text-base leading-7 text-muted-foreground">{tr ? seo.summary : "Choose your file, configure the available options, then process and download the result. Your file is handled in the browser unless the tool explicitly states that it uses AI."}</p>
      <ol className="mt-10 space-y-6">
        {(tr ? seo.steps : [{ title: "Choose a file", body: "Select a supported file within the size limit." }, { title: "Configure", body: "Review the options and preview before processing." }, { title: "Download", body: "Open the result and verify its content." }]).map((step, index) => (
          <li key={step.title}>
            <h2 className="text-xl font-semibold tracking-tight">
              {index + 1}. {step.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
      <div className="mt-10 space-y-4">
        {(tr ? seo.faqs : [{ question: "Is this tool free?", answer: "Yes. No account or daily limit is required." }]).map((item) => (
          <div key={item.question} className="rounded-2xl border border-border/70 bg-card p-5">
            <h2 className="text-base font-semibold">{item.question}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.answer}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold">
        {seo.related.map((item) => (
          <Link key={item.href} href={item.href} className="text-primary underline underline-offset-4">
            {tr ? item.label : "Related tool"} →
          </Link>
        ))}
      </div>
      <JsonLd data={faqSchema} />
      <JsonLd data={howToSchema} />
      <JsonLd data={breadcrumb} />
    </section>
  );
}
