import type {
  CVData,
  Certification,
  Education,
  LanguageSkill,
  PersonalInfo,
  Project,
  SkillGroup,
  WorkExperience,
} from "@/types/cv";

export type ChangeStatus = "pending" | "accepted" | "rejected";

export type CvChange = {
  id: string;
  section: string;
  before: string;
  after: string;
  applyTo: (cv: CVData) => CVData;
};

function clip(value: string, max = 420) {
  const text = value.trim();
  if (!text) return "";
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

function display(value: string) {
  return clip(value) || "—";
}

function jobKey(job: WorkExperience) {
  return job.id || `${job.company}|${job.position}|${job.startDate}`;
}

function eduKey(edu: Education) {
  return edu.id || `${edu.institution}|${edu.degree}|${edu.startDate}`;
}

function skillsText(groups: SkillGroup[]) {
  return groups.map((g) => `${g.category}: ${g.items.join(", ")}`).join("\n");
}

function projectsText(projects: Project[]) {
  return projects.map((p) => `${p.name}: ${p.description}`).join("\n");
}

function certsText(certs: Certification[]) {
  return certs.map((c) => [c.name, c.issuer, c.date].filter(Boolean).join(" · ")).join("\n");
}

function langsText(langs: LanguageSkill[]) {
  return langs.map((l) => `${l.language}: ${l.proficiency}`).join("\n");
}

export function diffCv(before: CVData, after: CVData): CvChange[] {
  const changes: CvChange[] = [];
  let n = 0;
  const push = (
    section: string,
    beforeText: string,
    afterText: string,
    applyTo: (cv: CVData) => CVData
  ) => {
    if (beforeText.trim() === afterText.trim()) return;
    n += 1;
    changes.push({
      id: `change-${n}`,
      section,
      before: display(beforeText),
      after: display(afterText),
      applyTo,
    });
  };

  const p0 = before.personalInfo;
  const p1 = after.personalInfo;
  (["title", "summary", "location"] as const).forEach((field: keyof PersonalInfo) => {
    const prev = String(p0[field] ?? "");
    const next = String(p1[field] ?? "");
    push(`Personal / ${field}`, prev, next, (cv) => ({
      ...cv,
      personalInfo: { ...cv.personalInfo, [field]: next },
    }));
  });

  const beforeJobs = new Map(before.workExperience.map((j) => [jobKey(j), j]));
  for (const job of after.workExperience) {
    const key = jobKey(job);
    const prev = beforeJobs.get(key);
    const label = [job.position, job.company].filter(Boolean).join(" · ") || "Experience";
    if (!prev) {
      push(label, "", [job.position, job.company, ...job.highlights].join("\n"), (cv) => ({
        ...cv,
        workExperience: cv.workExperience.some((j) => jobKey(j) === key)
          ? cv.workExperience
          : [...cv.workExperience, job],
      }));
      continue;
    }
    push(`${label} / title`, prev.position, job.position, (cv) => ({
      ...cv,
      workExperience: cv.workExperience.map((j) =>
        jobKey(j) === key ? { ...j, position: job.position } : j
      ),
    }));
    push(
      `${label} / bullets`,
      prev.highlights.filter(Boolean).join("\n"),
      job.highlights.filter(Boolean).join("\n"),
      (cv) => ({
        ...cv,
        workExperience: cv.workExperience.map((j) =>
          jobKey(j) === key ? { ...j, highlights: job.highlights } : j
        ),
      })
    );
  }

  const beforeEdus = new Map(before.education.map((e) => [eduKey(e), e]));
  for (const edu of after.education) {
    const key = eduKey(edu);
    const prev = beforeEdus.get(key);
    const label = [edu.degree, edu.institution].filter(Boolean).join(" · ") || "Education";
    if (!prev) {
      push(label, "", [edu.degree, edu.fieldOfStudy, edu.institution].join(" · "), (cv) => ({
        ...cv,
        education: cv.education.some((e) => eduKey(e) === key)
          ? cv.education
          : [...cv.education, edu],
      }));
      continue;
    }
    push(`${label} / field`, prev.fieldOfStudy, edu.fieldOfStudy, (cv) => ({
      ...cv,
      education: cv.education.map((e) =>
        eduKey(e) === key ? { ...e, fieldOfStudy: edu.fieldOfStudy } : e
      ),
    }));
  }

  push("Skills", skillsText(before.skills), skillsText(after.skills), (cv) => ({
    ...cv,
    skills: after.skills,
  }));

  const projects0 = before.projects ?? [];
  const projects1 = after.projects ?? [];
  push("Projects", projectsText(projects0), projectsText(projects1), (cv) => ({
    ...cv,
    projects: projects1,
  }));

  const certs0 = before.certifications ?? [];
  const certs1 = after.certifications ?? [];
  push("Certificates", certsText(certs0), certsText(certs1), (cv) => ({
    ...cv,
    certifications: certs1,
  }));

  const langs0 = before.languages ?? [];
  const langs1 = after.languages ?? [];
  push("Languages", langsText(langs0), langsText(langs1), (cv) => ({
    ...cv,
    languages: langs1,
  }));

  return changes.slice(0, 40);
}
