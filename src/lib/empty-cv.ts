import { v4 as uuid } from "uuid";
import type { CVData, TargetLanguage } from "@/types/cv";

export function createEmptyCv(targetLanguage: TargetLanguage = "EN"): CVData {
  return {
    personalInfo: {
      fullName: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      linkedinUrl: "",
      githubUrl: "",
      portfolioUrl: "",
      summary: "",
    },
    workExperience: [],
    education: [],
    skills: [{ category: "Technical", items: [] }],
    projects: [],
    certifications: [],
    languages: [],
    targetLanguage,
  };
}

export function newExperience() {
  return {
    id: uuid(),
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    current: false,
    location: "",
    highlights: [""],
  };
}

export function newEducation() {
  return {
    id: uuid(),
    institution: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
  };
}

export function newProject() {
  return {
    id: uuid(),
    name: "",
    description: "",
    link: "",
    technologies: [],
  };
}
