import type { TargetLanguage } from "@/types/cv";

const presentValues = new Set([
  "present",
  "current",
  "now",
  "günümüz",
  "halen",
  "devam",
  "devam ediyor",
]);

export function formatCvDate(value: string | undefined, language: TargetLanguage) {
  const raw = value?.trim();
  if (!raw) return "";

  if (presentValues.has(raw.toLocaleLowerCase("tr-TR"))) {
    return language === "TR" ? "Günümüz" : "Present";
  }

  const yearMonth = raw.match(/^(\d{4})[-/.](0?[1-9]|1[0-2])$/);
  const monthYear = raw.match(/^(0?[1-9]|1[0-2])[-/.](\d{4})$/);
  const year = yearMonth?.[1] ?? monthYear?.[2];
  const month = yearMonth?.[2] ?? monthYear?.[1];

  if (year && month) {
    return `${month.padStart(2, "0")}-${year}`;
  }

  return raw;
}

export function formatCvDateRange(
  startDate: string | undefined,
  endDate: string | undefined,
  current: boolean,
  language: TargetLanguage
) {
  const start = formatCvDate(startDate, language);
  const end = current
    ? language === "TR"
      ? "Günümüz"
      : "Present"
    : formatCvDate(endDate, language);

  return [start, end].filter(Boolean).join(" – ");
}

export function getCvDocumentLabels(language: TargetLanguage) {
  return language === "TR"
    ? {
        summary: "Profesyonel Özet",
        experience: "Deneyim",
        education: "Eğitim",
        skills: "Yetenekler",
        projects: "Projeler",
        certifications: "Sertifikalar",
        languages: "Diller",
        in: " · ",
      }
    : {
        summary: "Professional Summary",
        experience: "Experience",
        education: "Education",
        skills: "Skills",
        projects: "Projects",
        certifications: "Certifications",
        languages: "Languages",
        in: " in ",
      };
}
