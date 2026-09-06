export type TargetLanguage = "TR" | "EN";

export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  summary: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  location: string;
  highlights: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  link?: string;
  technologies: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
}

export interface LanguageSkill {
  language: string;
  proficiency: string;
}

export interface CVData {
  personalInfo: PersonalInfo;
  workExperience: WorkExperience[];
  education: Education[];
  skills: SkillGroup[];
  projects?: Project[];
  certifications?: Certification[];
  languages?: LanguageSkill[];
  targetLanguage: TargetLanguage;
}
