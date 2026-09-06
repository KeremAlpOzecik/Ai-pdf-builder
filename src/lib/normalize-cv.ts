import { v4 as uuid } from "uuid";
import { createEmptyCv } from "@/lib/empty-cv";
import type { CVData, TargetLanguage } from "@/types/cv";

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asBool(value: unknown): boolean {
  return value === true;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => asString(item)).filter(Boolean);
}

export function normalizeCv(raw: unknown, fallbackLang: TargetLanguage): CVData {
  const base = createEmptyCv(fallbackLang);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Record<string, unknown>;
  const personal = (data.personalInfo ?? {}) as Record<string, unknown>;

  const targetLanguage: TargetLanguage =
    data.targetLanguage === "TR" || data.targetLanguage === "EN"
      ? data.targetLanguage
      : fallbackLang;

  return {
    personalInfo: {
      fullName: asString(personal.fullName),
      title: asString(personal.title),
      email: asString(personal.email),
      phone: asString(personal.phone),
      location: asString(personal.location),
      linkedinUrl: asString(personal.linkedinUrl),
      githubUrl: asString(personal.githubUrl),
      portfolioUrl: asString(personal.portfolioUrl),
      summary: asString(personal.summary),
    },
    workExperience: Array.isArray(data.workExperience)
      ? data.workExperience.map((item) => {
          const row = (item ?? {}) as Record<string, unknown>;
          return {
            id: asString(row.id) || uuid(),
            company: asString(row.company),
            position: asString(row.position),
            startDate: asString(row.startDate),
            endDate: asString(row.endDate),
            current: asBool(row.current),
            location: asString(row.location),
            highlights: asStringArray(row.highlights),
          };
        })
      : [],
    education: Array.isArray(data.education)
      ? data.education.map((item) => {
          const row = (item ?? {}) as Record<string, unknown>;
          return {
            id: asString(row.id) || uuid(),
            institution: asString(row.institution),
            degree: asString(row.degree),
            fieldOfStudy: asString(row.fieldOfStudy),
            startDate: asString(row.startDate),
            endDate: asString(row.endDate),
          };
        })
      : [],
    skills: Array.isArray(data.skills)
      ? data.skills.map((item) => {
          const row = (item ?? {}) as Record<string, unknown>;
          return {
            category: asString(row.category) || "Technical",
            items: asStringArray(row.items),
          };
        })
      : base.skills,
    projects: Array.isArray(data.projects)
      ? data.projects.map((item) => {
          const row = (item ?? {}) as Record<string, unknown>;
          return {
            id: asString(row.id) || uuid(),
            name: asString(row.name),
            description: asString(row.description),
            link: asString(row.link),
            technologies: asStringArray(row.technologies),
          };
        })
      : [],
    certifications: Array.isArray(data.certifications)
      ? data.certifications.map((item) => {
          const row = (item ?? {}) as Record<string, unknown>;
          return {
            name: asString(row.name),
            issuer: asString(row.issuer),
            date: asString(row.date),
          };
        })
      : [],
    languages: Array.isArray(data.languages)
      ? data.languages.map((item) => {
          const row = (item ?? {}) as Record<string, unknown>;
          return {
            language: asString(row.language),
            proficiency: asString(row.proficiency),
          };
        })
      : [],
    targetLanguage,
  };
}
