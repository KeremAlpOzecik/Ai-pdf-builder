"use client";

import { Check } from "lucide-react";
import { useLabels } from "@/components/providers";
import { useCvStore } from "@/store/cv-store";
import type { ResumeTemplate } from "@/types/cv";

const templates: Array<{
  id: ResumeTemplate;
  name: "templateModern" | "templateClassic" | "templateCompact";
  hint: "templateModernHint" | "templateClassicHint" | "templateCompactHint";
}> = [
  { id: "modern", name: "templateModern", hint: "templateModernHint" },
  { id: "classic", name: "templateClassic", hint: "templateClassicHint" },
  { id: "compact", name: "templateCompact", hint: "templateCompactHint" },
];

function TemplateThumbnail({ template }: { template: ResumeTemplate }) {
  if (template === "modern") {
    return (
      <span className="grid h-16 grid-cols-[32%_1fr] overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-black/10">
        <span className="bg-[#173f3b] p-2">
          <span className="block h-2 w-5 rounded-full bg-white/90" />
          <span className="mt-3 block h-1 w-full bg-white/35" />
          <span className="mt-1 block h-1 w-4/5 bg-white/25" />
        </span>
        <span className="p-2">
          <span className="block h-2 w-3/5 bg-[#173f3b]" />
          <span className="mt-3 block h-1 w-full bg-stone-300" />
          <span className="mt-1 block h-1 w-4/5 bg-stone-200" />
          <span className="mt-3 block h-1 w-full bg-stone-300" />
        </span>
      </span>
    );
  }

  if (template === "compact") {
    return (
      <span className="block h-16 rounded-md bg-white p-2 shadow-sm ring-1 ring-black/10">
        <span className="block h-2 w-2/5 bg-[#214b72]" />
        <span className="mt-1 block h-1 w-3/5 bg-stone-300" />
        <span className="mt-2 block h-px w-full bg-[#214b72]" />
        <span className="mt-2 block h-1 w-full bg-stone-300" />
        <span className="mt-1 block h-1 w-5/6 bg-stone-200" />
        <span className="mt-2 block h-px w-full bg-[#214b72]" />
      </span>
    );
  }

  return (
    <span className="block h-16 rounded-md bg-[#fffdf9] p-2 text-center shadow-sm ring-1 ring-black/10">
      <span className="mx-auto block h-2 w-2/5 bg-stone-800" />
      <span className="mx-auto mt-1 block h-1 w-1/2 bg-stone-300" />
      <span className="mt-2 block h-px w-full bg-stone-300" />
      <span className="mt-2 block h-1 w-full bg-stone-300" />
      <span className="mt-1 block h-1 w-4/5 bg-stone-200" />
    </span>
  );
}

export function ResumeTemplatePicker() {
  const selected = useCvStore((state) => state.resumeTemplate);
  const setSelected = useCvStore((state) => state.setResumeTemplate);
  const labels = useLabels();

  return (
    <section className="mb-5" aria-labelledby="resume-template-label">
      <div className="mb-3">
        <h2 id="resume-template-label" className="text-sm font-semibold">
          {labels.templateLabel}
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{labels.templateHint}</p>
      </div>
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={labels.templateLabel}>
        {templates.map((template) => {
          const active = selected === template.id;
          return (
            <button
              key={template.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(template.id)}
              className={`relative rounded-xl border p-2 text-left transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                active ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "bg-card"
              }`}
            >
              {active ? (
                <span className="absolute right-1.5 top-1.5 z-10 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3" aria-hidden="true" />
                </span>
              ) : null}
              <TemplateThumbnail template={template.id} />
              <span className="mt-2 block text-[13px] font-semibold leading-tight">
                {labels[template.name]}
              </span>
              <span className="mt-0.5 hidden text-[11px] leading-snug text-muted-foreground sm:block">
                {labels[template.hint]}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
