"use client";

import type { ReactNode } from "react";
import { AtSign, BriefcaseBusiness, Globe2, MapPin, Phone } from "lucide-react";
import { formatCvDate, formatCvDateRange, getCvDocumentLabels } from "@/lib/cv-format";
import type { CVData, ResumeTemplate } from "@/types/cv";
import { useLabels } from "@/components/providers";

type PreviewProps = { cv: CVData; template: ResumeTemplate };

function SectionTitle({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  return <h2 className={compact ? "mb-2 border-b-2 border-[#214b72] pb-1 text-[10px] font-bold tracking-[0.16em] text-[#214b72] uppercase" : "mb-3 text-[10px] font-bold tracking-[0.2em] text-current/60 uppercase"}>{children}</h2>;
}

function ExperienceList({ cv, compact = false }: { cv: CVData; compact?: boolean }) {
  return <div className={compact ? "space-y-3" : "space-y-5"}>{cv.workExperience.map((job) => <div key={job.id}>
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <p className={compact ? "text-[12.5px] font-bold" : "text-sm font-semibold"}>{job.position}</p>
      <p className="text-[10.5px] text-current/60">{formatCvDateRange(job.startDate, job.endDate, job.current, cv.targetLanguage)}</p>
    </div>
    <p className={`${compact ? "text-[12px]" : "text-[13px]"} font-medium text-current/80`}>{[job.company, job.location].filter(Boolean).join(" · ")}</p>
    <ul className={`${compact ? "mt-1 space-y-0.5 text-[11px]" : "mt-2 space-y-1 text-[12.5px]"} list-disc pl-4 leading-relaxed text-current/80`}>{job.highlights.filter(Boolean).map((highlight, index) => <li key={`${job.id}-${index}`}>{highlight}</li>)}</ul>
  </div>)}</div>;
}

function EducationList({ cv }: { cv: CVData }) {
  const labels = getCvDocumentLabels(cv.targetLanguage);
  return <div className="space-y-2.5">{cv.education.map((education) => <div key={education.id} className="flex flex-wrap items-start justify-between gap-x-4">
    <div><p className="text-[12.5px] font-semibold">{[education.degree, education.fieldOfStudy].filter(Boolean).join(labels.in)}</p><p className="text-[11.5px] text-current/70">{education.institution}</p></div>
    <p className="text-[10.5px] text-current/60">{formatCvDateRange(education.startDate, education.endDate, false, cv.targetLanguage)}</p>
  </div>)}</div>;
}

function ProjectsList({ cv }: { cv: CVData }) {
  return <div className="space-y-2.5">{cv.projects?.map((project) => <div key={project.id}><p className="text-[12.5px] font-semibold">{project.name}</p><p className="text-[11.5px] leading-relaxed text-current/80">{project.description}</p>{project.technologies.length ? <p className="mt-0.5 text-[10.5px] text-current/60">{project.technologies.join(" · ")}</p> : null}</div>)}</div>;
}

function ClassicPreview({ cv }: { cv: CVData }) {
  const p = cv.personalInfo;
  const labels = getCvDocumentLabels(cv.targetLanguage);
  const contact = [p.email, p.phone, p.location].filter(Boolean).join("  ·  ");
  return <article className="mx-auto min-h-[297mm] w-full max-w-[210mm] bg-[#fffdf9] px-12 py-12 text-[#302a27] shadow-[0_24px_60px_rgb(28_25_23/0.12)] ring-1 ring-black/5">
    <header className="mb-8 border-b border-[#302a27]/15 pb-6 text-center"><h1 className="font-heading text-[2rem] leading-tight tracking-tight">{p.fullName || "Curriculum Vitae"}</h1>{p.title ? <p className="mt-2 text-sm font-medium tracking-wide text-[#315c4a]">{p.title}</p> : null}{contact ? <p className="mt-3 text-[10.5px] text-[#675e59]">{contact}</p> : null}<p className="mt-1 text-[10.5px] text-[#675e59]">{[p.linkedinUrl, p.githubUrl, p.portfolioUrl].filter(Boolean).join("  ·  ")}</p></header>
    {p.summary ? <section className="mb-7"><SectionTitle>{labels.summary}</SectionTitle><p className="text-[12.5px] leading-relaxed text-current/80">{p.summary}</p></section> : null}
    {cv.workExperience.length ? <section className="mb-7"><SectionTitle>{labels.experience}</SectionTitle><ExperienceList cv={cv} /></section> : null}
    {cv.education.length ? <section className="mb-7"><SectionTitle>{labels.education}</SectionTitle><EducationList cv={cv} /></section> : null}
    {cv.skills.some((group) => group.items.length) ? <section className="mb-7"><SectionTitle>{labels.skills}</SectionTitle>{cv.skills.filter((group) => group.items.length).map((group) => <p key={group.category} className="text-[12px]"><strong>{group.category}: </strong>{group.items.join(", ")}</p>)}</section> : null}
    {cv.projects?.length ? <section className="mb-7"><SectionTitle>{labels.projects}</SectionTitle><ProjectsList cv={cv} /></section> : null}
    {cv.certifications?.length ? <section className="mb-7"><SectionTitle>{labels.certifications}</SectionTitle>{cv.certifications.map((certification, index) => <p key={`${certification.name}-${index}`} className="text-[12px]">{[certification.name, certification.issuer, formatCvDate(certification.date, cv.targetLanguage)].filter(Boolean).join(" · ")}</p>)}</section> : null}
    {cv.languages?.length ? <section><SectionTitle>{labels.languages}</SectionTitle><p className="text-[12px]">{cv.languages.map((language) => `${language.language} (${language.proficiency})`).join(" · ")}</p></section> : null}
  </article>;
}

function ModernPreview({ cv }: { cv: CVData }) {
  const p = cv.personalInfo;
  const labels = getCvDocumentLabels(cv.targetLanguage);
  return <article className="mx-auto grid min-h-[297mm] w-full max-w-[210mm] grid-cols-[34%_1fr] overflow-hidden bg-white text-[#20302d] shadow-[0_24px_60px_rgb(28_25_23/0.12)] ring-1 ring-black/5">
    <aside className="bg-[#173f3b] px-7 py-10 text-[#f4f0e8]">
      <div className="mb-8 grid size-16 place-items-center rounded-full bg-[#f4f0e8] font-heading text-2xl text-[#173f3b]">{(p.fullName || "CV").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</div>
      <div className="space-y-2 text-[10.5px] leading-relaxed text-white/80">{p.email ? <p className="flex gap-2"><AtSign className="mt-0.5 size-3 shrink-0" />{p.email}</p> : null}{p.phone ? <p className="flex gap-2"><Phone className="mt-0.5 size-3 shrink-0" />{p.phone}</p> : null}{p.location ? <p className="flex gap-2"><MapPin className="mt-0.5 size-3 shrink-0" />{p.location}</p> : null}{p.portfolioUrl ? <p className="flex gap-2 break-all"><Globe2 className="mt-0.5 size-3 shrink-0" />{p.portfolioUrl}</p> : null}{p.linkedinUrl ? <p className="break-all">{p.linkedinUrl}</p> : null}{p.githubUrl ? <p className="break-all">{p.githubUrl}</p> : null}</div>
      {cv.skills.some((group) => group.items.length) ? <section className="mt-9"><SectionTitle>{labels.skills}</SectionTitle><div className="space-y-4">{cv.skills.filter((group) => group.items.length).map((group) => <div key={group.category}><p className="text-[11px] font-semibold">{group.category}</p><p className="mt-1 text-[10.5px] leading-relaxed text-white/70">{group.items.join(" · ")}</p></div>)}</div></section> : null}
      {cv.languages?.length ? <section className="mt-9"><SectionTitle>{labels.languages}</SectionTitle><div className="space-y-1 text-[10.5px]">{cv.languages.map((language) => <p key={language.language}><strong>{language.language}</strong><span className="text-white/60"> · {language.proficiency}</span></p>)}</div></section> : null}
    </aside>
    <div className="px-9 py-10"><header className="mb-8"><h1 className="font-heading text-[2.15rem] leading-[1.05] tracking-tight text-[#173f3b]">{p.fullName || "Curriculum Vitae"}</h1>{p.title ? <p className="mt-3 flex items-center gap-2 text-[12px] font-semibold tracking-[0.12em] text-[#b06f43] uppercase"><BriefcaseBusiness className="size-3.5" />{p.title}</p> : null}</header>
      {p.summary ? <section className="mb-7"><SectionTitle>{labels.summary}</SectionTitle><p className="text-[12px] leading-relaxed text-current/75">{p.summary}</p></section> : null}{cv.workExperience.length ? <section className="mb-7"><SectionTitle>{labels.experience}</SectionTitle><ExperienceList cv={cv} /></section> : null}{cv.education.length ? <section className="mb-7"><SectionTitle>{labels.education}</SectionTitle><EducationList cv={cv} /></section> : null}{cv.projects?.length ? <section className="mb-7"><SectionTitle>{labels.projects}</SectionTitle><ProjectsList cv={cv} /></section> : null}{cv.certifications?.length ? <section><SectionTitle>{labels.certifications}</SectionTitle>{cv.certifications.map((certification, index) => <p key={`${certification.name}-${index}`} className="text-[11.5px]">{[certification.name, certification.issuer, formatCvDate(certification.date, cv.targetLanguage)].filter(Boolean).join(" · ")}</p>)}</section> : null}
    </div>
  </article>;
}

function CompactPreview({ cv }: { cv: CVData }) {
  const p = cv.personalInfo;
  const labels = getCvDocumentLabels(cv.targetLanguage);
  return <article className="mx-auto min-h-[297mm] w-full max-w-[210mm] bg-white px-10 py-9 text-[#17212b] shadow-[0_24px_60px_rgb(28_25_23/0.12)] ring-1 ring-black/5">
    <header className="mb-5 border-b-4 border-[#214b72] pb-4"><div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-[1.75rem] font-bold tracking-tight text-[#183b5b]">{p.fullName || "Curriculum Vitae"}</h1>{p.title ? <p className="mt-0.5 text-[12px] font-semibold text-[#356a94]">{p.title}</p> : null}</div><p className="max-w-[55%] text-right text-[9.5px] leading-relaxed text-[#53606b]">{[p.email, p.phone, p.location, p.linkedinUrl].filter(Boolean).join(" · ")}</p></div></header>
    {p.summary ? <section className="mb-4"><SectionTitle compact>{labels.summary}</SectionTitle><p className="text-[11px] leading-relaxed">{p.summary}</p></section> : null}{cv.workExperience.length ? <section className="mb-4"><SectionTitle compact>{labels.experience}</SectionTitle><ExperienceList cv={cv} compact /></section> : null}
    <div className="grid grid-cols-2 gap-x-7">{cv.education.length ? <section className="mb-4"><SectionTitle compact>{labels.education}</SectionTitle><EducationList cv={cv} /></section> : null}{cv.skills.some((group) => group.items.length) ? <section className="mb-4"><SectionTitle compact>{labels.skills}</SectionTitle>{cv.skills.filter((group) => group.items.length).map((group) => <p key={group.category} className="mb-1 text-[10.5px]"><strong>{group.category}: </strong>{group.items.join(", ")}</p>)}</section> : null}</div>
    {cv.projects?.length ? <section className="mb-4"><SectionTitle compact>{labels.projects}</SectionTitle><ProjectsList cv={cv} /></section> : null}<div className="grid grid-cols-2 gap-x-7">{cv.certifications?.length ? <section><SectionTitle compact>{labels.certifications}</SectionTitle>{cv.certifications.map((certification, index) => <p key={`${certification.name}-${index}`} className="text-[10.5px]">{[certification.name, certification.issuer, formatCvDate(certification.date, cv.targetLanguage)].filter(Boolean).join(" · ")}</p>)}</section> : null}{cv.languages?.length ? <section><SectionTitle compact>{labels.languages}</SectionTitle><p className="text-[10.5px]">{cv.languages.map((language) => `${language.language} (${language.proficiency})`).join(" · ")}</p></section> : null}</div>
  </article>;
}

export function CvPreview({ cv, template }: PreviewProps) {
  const labels = useLabels();
  const p = cv.personalInfo;
  const empty = !p.fullName && !p.summary && cv.workExperience.length === 0 && cv.education.length === 0;
  if (empty) return <div className="flex h-full min-h-[420px] items-center justify-center rounded-xl border border-dashed border-border bg-card px-8 text-center text-sm leading-relaxed text-muted-foreground">{labels.emptyPreview}</div>;
  if (template === "classic") return <ClassicPreview cv={cv} />;
  if (template === "compact") return <CompactPreview cv={cv} />;
  return <ModernPreview cv={cv} />;
}
