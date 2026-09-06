"use client";

import type { CVData } from "@/types/cv";
import { useLabels } from "@/components/providers";

export function CvPreview({ cv }: { cv: CVData }) {
  const labels = useLabels();
  const p = cv.personalInfo;
  const empty =
    !p.fullName &&
    !p.summary &&
    cv.workExperience.length === 0 &&
    cv.education.length === 0;

  if (empty) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center rounded-xl border border-dashed border-border bg-card px-8 text-center text-sm leading-relaxed text-muted-foreground">
        {labels.emptyPreview}
      </div>
    );
  }

  const contact = [p.email, p.phone, p.location].filter(Boolean).join("  ·  ");

  return (
    <article className="mx-auto min-h-[420px] w-full max-w-[210mm] bg-[oklch(0.995_0.004_90)] px-11 py-12 text-foreground shadow-[0_24px_60px_rgb(28_25_23/0.12)] ring-1 ring-black/5">
      <header className="mb-8 border-b border-foreground/10 pb-6">
        <h1 className="font-heading text-[1.85rem] leading-tight tracking-tight">
          {p.fullName || "Curriculum Vitae"}
        </h1>
        {p.title ? (
          <p className="mt-2 text-sm font-medium tracking-wide text-primary">
            {p.title}
          </p>
        ) : null}
        {contact ? (
          <p className="mt-3 text-[11px] tracking-[0.04em] text-muted-foreground">
            {contact}
          </p>
        ) : null}
        <div className="mt-1.5 flex flex-wrap gap-x-3 text-[11px] text-muted-foreground">
          {p.linkedinUrl ? <span>{p.linkedinUrl}</span> : null}
          {p.githubUrl ? <span>{p.githubUrl}</span> : null}
          {p.portfolioUrl ? <span>{p.portfolioUrl}</span> : null}
        </div>
      </header>

      {p.summary ? (
        <section className="mb-7">
          <h2 className="mb-2 text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            {labels.summary}
          </h2>
          <p className="text-[13.5px] leading-relaxed text-foreground/85">{p.summary}</p>
        </section>
      ) : null}

      {cv.workExperience.length ? (
        <section className="mb-7">
          <h2 className="mb-3 text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            {labels.experience}
          </h2>
          <div className="space-y-5">
            {cv.workExperience.map((job) => (
              <div key={job.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold">{job.position}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {job.startDate}
                    {job.startDate || job.endDate || job.current ? " – " : ""}
                    {job.current ? "Present" : job.endDate}
                  </p>
                </div>
                {job.company ? (
                  <p className="text-sm text-primary">{job.company}</p>
                ) : null}
                {job.location ? (
                  <p className="text-[11px] text-muted-foreground">{job.location}</p>
                ) : null}
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[13.5px] leading-relaxed text-foreground/85">
                  {job.highlights.filter(Boolean).map((h, i) => (
                    <li key={`${job.id}-${i}`}>{h}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {cv.education.length ? (
        <section className="mb-7">
          <h2 className="mb-3 text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            {labels.education}
          </h2>
          {cv.education.map((edu) => (
            <div key={edu.id} className="mb-2 text-sm">
              <p className="font-semibold">
                {[edu.degree, edu.fieldOfStudy].filter(Boolean).join(" in ")}
              </p>
              <p className="text-[12px] text-muted-foreground">
                {[edu.institution, `${edu.startDate} – ${edu.endDate}`]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          ))}
        </section>
      ) : null}

      {cv.skills.some((g) => g.items.length) ? (
        <section className="mb-7">
          <h2 className="mb-3 text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            {labels.skills}
          </h2>
          {cv.skills
            .filter((g) => g.items.length)
            .map((g) => (
              <p key={g.category} className="text-sm">
                <span className="font-semibold">{g.category}: </span>
                {g.items.join(", ")}
              </p>
            ))}
        </section>
      ) : null}

      {cv.projects?.length ? (
        <section className="mb-7">
          <h2 className="mb-3 text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            {labels.projects}
          </h2>
          {cv.projects.map((project) => (
            <div key={project.id} className="mb-2 text-sm">
              <p className="font-semibold">{project.name}</p>
              <p className="text-foreground/85">{project.description}</p>
              {project.technologies.length ? (
                <p className="text-[12px] text-muted-foreground">
                  {project.technologies.join(", ")}
                </p>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}

      {cv.certifications?.length ? (
        <section className="mb-7">
          <h2 className="mb-3 text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            {labels.certifications}
          </h2>
          {cv.certifications.map((cert, i) => (
            <p key={`${cert.name}-${i}`} className="text-sm">
              {[cert.name, cert.issuer, cert.date].filter(Boolean).join(" · ")}
            </p>
          ))}
        </section>
      ) : null}

      {cv.languages?.length ? (
        <section>
          <h2 className="mb-3 text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            {labels.language}
          </h2>
          <p className="text-sm">
            {cv.languages
              .map((l) => `${l.language} (${l.proficiency})`)
              .join(" · ")}
          </p>
        </section>
      ) : null}
    </article>
  );
}
