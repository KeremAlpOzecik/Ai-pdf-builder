import type { CVData } from "@/types/cv";

export function cvHasContent(cv: CVData): boolean {
  return Boolean(
    cv.personalInfo.fullName ||
      cv.personalInfo.summary ||
      cv.workExperience.length ||
      cv.education.length ||
      cv.projects?.length ||
      cv.certifications?.length ||
      cv.languages?.length ||
      cv.skills.some((group) => group.items.length)
  );
}
