import { createEmptyCv } from "@/lib/empty-cv";
import type { CVData, TargetLanguage } from "@/types/cv";

type Section = "summary" | "experience" | "education" | "skills" | "languages" | "certifications" | "projects";
const headings: Record<Section, RegExp> = {
  summary: /^(summary|profile|about me|professional summary|özet|profil|hakkımda|kişisel profil)$/iu,
  experience: /^(work experience|experience|employment|professional experience|iş deneyimi|iş deneyimleri|deneyim|deneyimler|çalışma geçmişi)$/iu,
  education: /^(education|academic background|eğitim|eğitim bilgileri|öğrenim)$/iu,
  skills: /^(skills|technical skills|competencies|yetenekler|beceriler|teknik beceriler|yetkinlikler)$/iu,
  languages: /^(languages|language skills|diller|yabancı dil|yabancı diller)$/iu,
  certifications: /^(certifications|certificates|sertifikalar|sertifika)$/iu,
  projects: /^(projects|personal projects|projeler)$/iu,
};
const emailPattern = /[\w.+-]+@[\w.-]+\.[a-z]{2,}/iu;
const phonePattern = /(?:\+\d{1,3}[\s().-]*)?(?:\(?\d{3}\)?[\s.-]*)\d{3}[\s.-]*\d{2}[\s.-]*\d{2}\b/u;
const datePattern = /(?:\b(?:19|20)\d{2}\b|\b(?:0?[1-9]|1[0-2])[/.](?:19|20)\d{2}\b)/u;
const id = () => crypto.randomUUID();

function splitEntries(lines: string[]) {
  const entries: string[][] = [];
  let current: string[] = [];
  for (const line of lines) {
    if (!line.trim()) {
      if (current.length) entries.push(current);
      current = [];
    } else current.push(line);
  }
  if (current.length) entries.push(current);
  // Dates normally follow the position/company. A new title after a dated
  // entry is only split at explicit blank boundaries; ambiguity stays visible.
  return entries;
}

function dates(lines: string[]) {
  const line = lines.find(value => datePattern.test(value)) ?? "";
  const values = line.match(/(?:0?[1-9]|1[0-2])[/.](?:19|20)\d{2}|(?:19|20)\d{2}/gu) ?? [];
  return { startDate: values[0] ?? "", endDate: values[1] ?? "", current: /present|current|devam|halen|günümüz/iu.test(line), line };
}

export function parseLocalCvText(text: string, targetLanguage: TargetLanguage): CVData {
  const cv = createEmptyCv(targetLanguage);
  const lines = text.replace(/\r/g, "").split("\n").map(line => line.trim());
  const sections: Partial<Record<Section, string[]>> = {};
  const intro: string[] = [];
  let section: Section | undefined;
  for (const line of lines) {
    const heading = line.replace(/[:：]\s*$/, "").trim().toLocaleLowerCase("tr-TR").replaceAll("ı", "i");
    const match = (Object.keys(headings) as Section[]).find(key => new RegExp(headings[key].source.replaceAll("ı", "i"), "u").test(heading));
    if (match) { section = match; sections[match] ??= []; }
    else if (section) sections[section]!.push(line);
    else intro.push(line);
  }
  cv.personalInfo.email = text.match(emailPattern)?.[0] ?? "";
  cv.personalInfo.phone = text.match(phonePattern)?.[0] ?? "";
  cv.personalInfo.linkedinUrl = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s]+/iu)?.[0] ?? "";
  cv.personalInfo.githubUrl = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s]+/iu)?.[0] ?? "";
  const candidates = intro.filter(line => line && !emailPattern.test(line) && !phonePattern.test(line) && !/https?:|www\.|linkedin\.|github\./iu.test(line) && !/^(cv|resume|curriculum vitae|özgeçmiş|contact|iletişim)$/iu.test(line));
  const name = candidates.find(line => /^[\p{L}][\p{L} .'-]+$/u.test(line) && line.split(/\s+/).length >= 2 && line.split(/\s+/).length <= 5);
  cv.personalInfo.fullName = name ?? "";
  // Only take a title immediately below a plausible name; do not guess other fields.
  const nameIndex = name ? intro.indexOf(name) : -1;
  const possibleTitle = nameIndex >= 0 ? intro[nameIndex + 1] : "";
  if (possibleTitle && candidates.includes(possibleTitle) && possibleTitle.length < 90) cv.personalInfo.title = possibleTitle;
  cv.personalInfo.summary = (sections.summary ?? []).filter(Boolean).join("\n");
  cv.workExperience = splitEntries(sections.experience ?? []).map(entry => {
    const range = dates(entry);
    const content = entry.filter(line => line !== range.line);
    return { id: id(), position: content[0] ?? "", company: content[1] ?? "", startDate: range.startDate, endDate: range.endDate, current: range.current, location: "", highlights: content.slice(2).map(line => line.replace(/^[•●▪*-]\s*/, "")) };
  });
  cv.education = splitEntries(sections.education ?? []).map(entry => {
    const range = dates(entry);
    const content = entry.filter(line => line !== range.line);
    return { id: id(), institution: content[0] ?? "", degree: content[1] ?? "", fieldOfStudy: content.slice(2).join(" · "), startDate: range.startDate, endDate: range.endDate };
  });
  cv.skills = [{ category: targetLanguage === "TR" ? "Beceriler" : "Skills", items: (sections.skills ?? []).flatMap(line => line.split(/[,;•|]/u)).map(value => value.trim()).filter(Boolean) }];
  cv.languages = (sections.languages ?? []).filter(Boolean).map(line => { const [language, ...level] = line.split(/\s*[:–—]\s*/u); return { language, proficiency: level.join(" ") }; });
  cv.certifications = (sections.certifications ?? []).filter(Boolean).map(name => ({ name, issuer: "", date: "" }));
  cv.projects = splitEntries(sections.projects ?? []).map(entry => ({ id: id(), name: entry[0], description: entry.slice(1).join("\n"), technologies: [] }));
  return cv;
}
