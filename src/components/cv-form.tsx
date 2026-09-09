"use client";

import { cloneElement, isValidElement, useId, type ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImportDropzones } from "@/components/import-dropzone";
import type { FormTab } from "@/store/cv-store";
import {
  newEducation,
  newExperience,
  newProject,
} from "@/lib/empty-cv";
import { useDisplayLanguage, useLabels } from "@/components/providers";
import { useCvStore } from "@/store/cv-store";
import type { CVData } from "@/types/cv";

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      {isValidElement<{ id?: string }>(children) ? cloneElement(children, { id }) : children}
    </div>
  );
}

export function CvForm() {
  const cv = useCvStore((s) => s.cv);
  const setCv = useCvStore((s) => s.setCv);
  const formTab = useCvStore((s) => s.formTab);
  const setFormTab = useCvStore((s) => s.setFormTab);
  const labels = useLabels();
  const tr = useDisplayLanguage() === "TR";

  function update(next: CVData) {
    setCv(next);
  }

  return (
    <div>

    <Tabs
      value={formTab}
      onValueChange={(value) => setFormTab(value as FormTab)}
      className="w-full gap-4"
    >
      <TabsList
        variant="line"
        className="scrollbar-none flex h-auto w-full flex-wrap justify-start gap-0 border-b pb-px"
      >
        <TabsTrigger value="import" className="shrink-0 px-3 py-2.5 text-[13px]">
          {labels.import}
        </TabsTrigger>
        <TabsTrigger value="personal" className="shrink-0 px-3 py-2.5 text-[13px]">
          {labels.personal}
        </TabsTrigger>
        <TabsTrigger value="experience" className="shrink-0 px-3 py-2.5 text-[13px]">
          {labels.experience}
        </TabsTrigger>
        <TabsTrigger value="education" className="shrink-0 px-3 py-2.5 text-[13px]">
          {labels.education}
        </TabsTrigger>
        <TabsTrigger value="skills" className="shrink-0 px-3 py-2.5 text-[13px]">
          {labels.skills}
        </TabsTrigger>
        <TabsTrigger value="projects" className="shrink-0 px-3 py-2.5 text-[13px]">
          {labels.projects}
        </TabsTrigger>
        <TabsTrigger value="certs" className="shrink-0 px-3 py-2.5 text-[13px]">
          {labels.certifications}
        </TabsTrigger>
        <TabsTrigger value="other" className="shrink-0 px-3 py-2.5 text-[13px]">
          {tr ? "Diller" : "Languages"}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="import" className="mt-4">
        <ImportDropzones />
      </TabsContent>

      <TabsContent value="personal" className="mt-4 grid gap-3">
        <Field label={labels.fullName}>
          <Input
            value={cv.personalInfo.fullName}
            onChange={(e) =>
              update({
                ...cv,
                personalInfo: { ...cv.personalInfo, fullName: e.target.value },
              })
            }
          />
        </Field>
        <Field label={labels.title}>
          <Input
            value={cv.personalInfo.title}
            onChange={(e) =>
              update({
                ...cv,
                personalInfo: { ...cv.personalInfo, title: e.target.value },
              })
            }
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={labels.email}>
            <Input
              type="email"
              value={cv.personalInfo.email}
              onChange={(e) =>
                update({
                  ...cv,
                  personalInfo: { ...cv.personalInfo, email: e.target.value },
                })
              }
            />
          </Field>
          <Field label={labels.phone}>
            <Input
              value={cv.personalInfo.phone}
              onChange={(e) =>
                update({
                  ...cv,
                  personalInfo: { ...cv.personalInfo, phone: e.target.value },
                })
              }
            />
          </Field>
        </div>
        <Field label={labels.location}>
          <Input
            value={cv.personalInfo.location}
            onChange={(e) =>
              update({
                ...cv,
                personalInfo: { ...cv.personalInfo, location: e.target.value },
              })
            }
          />
        </Field>
        <Field label={labels.linkedin}>
          <Input
            value={cv.personalInfo.linkedinUrl ?? ""}
            onChange={(e) =>
              update({
                ...cv,
                personalInfo: { ...cv.personalInfo, linkedinUrl: e.target.value },
              })
            }
          />
        </Field>
        <Field label={labels.github}>
          <Input
            value={cv.personalInfo.githubUrl ?? ""}
            onChange={(e) =>
              update({
                ...cv,
                personalInfo: { ...cv.personalInfo, githubUrl: e.target.value },
              })
            }
          />
        </Field>
        <Field label={labels.portfolio}>
          <Input
            value={cv.personalInfo.portfolioUrl ?? ""}
            onChange={(e) =>
              update({
                ...cv,
                personalInfo: { ...cv.personalInfo, portfolioUrl: e.target.value },
              })
            }
          />
        </Field>
        <Field label={labels.summary}>
          <Textarea
            value={cv.personalInfo.summary}
            onChange={(e) =>
              update({
                ...cv,
                personalInfo: { ...cv.personalInfo, summary: e.target.value },
              })
            }
          />
        </Field>
      </TabsContent>

      <TabsContent value="experience" className="mt-4 space-y-4">
        {cv.workExperience.map((job, index) => (
          <div key={job.id} className="space-y-3 rounded-xl border border-border bg-muted/25 p-4">
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={labels.delete}
                onClick={() =>
                  update({
                    ...cv,
                    workExperience: cv.workExperience.filter((_, i) => i !== index),
                  })
                }
              >
                <Trash2 />
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={labels.position}>
                <Input
                  value={job.position}
                  onChange={(e) => {
                    const workExperience = [...cv.workExperience];
                    workExperience[index] = { ...job, position: e.target.value };
                    update({ ...cv, workExperience });
                  }}
                />
              </Field>
              <Field label={labels.company}>
                <Input
                  value={job.company}
                  onChange={(e) => {
                    const workExperience = [...cv.workExperience];
                    workExperience[index] = { ...job, company: e.target.value };
                    update({ ...cv, workExperience });
                  }}
                />
              </Field>
            </div>
            <Field label={labels.location}>
              <Input
                value={job.location}
                onChange={(e) => {
                  const workExperience = [...cv.workExperience];
                  workExperience[index] = { ...job, location: e.target.value };
                  update({ ...cv, workExperience });
                }}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={labels.startDate}>
                <Input
                  value={job.startDate}
                  placeholder={labels.datePlaceholder}
                  onChange={(e) => {
                    const workExperience = [...cv.workExperience];
                    workExperience[index] = { ...job, startDate: e.target.value };
                    update({ ...cv, workExperience });
                  }}
                />
              </Field>
              <Field label={labels.endDate}>
                <Input
                  value={job.endDate}
                  placeholder={labels.datePlaceholder}
                  disabled={job.current}
                  onChange={(e) => {
                    const workExperience = [...cv.workExperience];
                    workExperience[index] = { ...job, endDate: e.target.value };
                    update({ ...cv, workExperience });
                  }}
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={job.current}
                onChange={(e) => {
                  const workExperience = [...cv.workExperience];
                  workExperience[index] = {
                    ...job,
                    current: e.target.checked,
                    endDate: e.target.checked ? "" : job.endDate,
                  };
                  update({ ...cv, workExperience });
                }}
              />
              {labels.current}
            </label>
            <Field label={labels.highlights}>
              <Textarea
                value={job.highlights.join("\n")}
                onChange={(e) => {
                  const workExperience = [...cv.workExperience];
                  workExperience[index] = {
                    ...job,
                    highlights: e.target.value.split("\n"),
                  };
                  update({ ...cv, workExperience });
                }}
              />
            </Field>
          </div>
        ))}
        <Button
          variant="outline"
          onClick={() =>
            update({ ...cv, workExperience: [...cv.workExperience, newExperience()] })
          }
        >
          <Plus data-icon="inline-start" />
          {labels.addExperience}
        </Button>
      </TabsContent>

      <TabsContent value="education" className="mt-4 space-y-4">
        {cv.education.map((edu, index) => (
          <div key={edu.id} className="space-y-3 rounded-xl border border-border bg-muted/25 p-4">
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={labels.delete}
                onClick={() =>
                  update({
                    ...cv,
                    education: cv.education.filter((_, i) => i !== index),
                  })
                }
              >
                <Trash2 />
              </Button>
            </div>
            <Field label={labels.institution}>
              <Input
                value={edu.institution}
                onChange={(e) => {
                  const education = [...cv.education];
                  education[index] = { ...edu, institution: e.target.value };
                  update({ ...cv, education });
                }}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={labels.degree}>
                <Input
                  value={edu.degree}
                  onChange={(e) => {
                    const education = [...cv.education];
                    education[index] = { ...edu, degree: e.target.value };
                    update({ ...cv, education });
                  }}
                />
              </Field>
              <Field label={labels.field}>
                <Input
                  value={edu.fieldOfStudy}
                  onChange={(e) => {
                    const education = [...cv.education];
                    education[index] = { ...edu, fieldOfStudy: e.target.value };
                    update({ ...cv, education });
                  }}
                />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={labels.startDate}>
                <Input
                  value={edu.startDate}
                  placeholder={labels.datePlaceholder}
                  onChange={(e) => {
                    const education = [...cv.education];
                    education[index] = { ...edu, startDate: e.target.value };
                    update({ ...cv, education });
                  }}
                />
              </Field>
              <Field label={labels.endDate}>
                <Input
                  value={edu.endDate}
                  placeholder={labels.datePlaceholder}
                  onChange={(e) => {
                    const education = [...cv.education];
                    education[index] = { ...edu, endDate: e.target.value };
                    update({ ...cv, education });
                  }}
                />
              </Field>
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          onClick={() => update({ ...cv, education: [...cv.education, newEducation()] })}
        >
          <Plus data-icon="inline-start" />
          {labels.addEducation}
        </Button>
      </TabsContent>

      <TabsContent value="other" className="mt-4 space-y-4">
        <div className="space-y-3">
          {(cv.languages ?? []).map((lang, index) => (
            <div key={`lang-${index}`} className="grid gap-3 sm:grid-cols-2">
              <Field label={labels.language}>
                <Input
                  value={lang.language}
                  onChange={(e) => {
                    const languages = [...(cv.languages ?? [])];
                    languages[index] = { ...lang, language: e.target.value };
                    update({ ...cv, languages });
                  }}
                />
              </Field>
              <Field label={labels.proficiency}>
                <Input
                  value={lang.proficiency}
                  onChange={(e) => {
                    const languages = [...(cv.languages ?? [])];
                    languages[index] = { ...lang, proficiency: e.target.value };
                    update({ ...cv, languages });
                  }}
                />
              </Field>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() =>
              update({
                ...cv,
                languages: [...(cv.languages ?? []), { language: "", proficiency: "" }],
              })
            }
          >
            <Plus data-icon="inline-start" />
            {labels.addLanguage}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="skills" className="mt-4 space-y-4">
        {cv.skills.map((group, index) => (
          <div key={`skill-${index}`} className="space-y-3 rounded-xl border border-border bg-muted/25 p-4">
            <Field label={labels.category}>
              <Input
                value={group.category}
                onChange={(e) => {
                  const skills = [...cv.skills];
                  skills[index] = { ...group, category: e.target.value };
                  update({ ...cv, skills });
                }}
              />
            </Field>
            <Field label={labels.skillItems}>
              <Textarea
                value={group.items.join(", ")}
                onChange={(e) => {
                  const skills = [...cv.skills];
                  skills[index] = {
                    ...group,
                    items: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  };
                  update({ ...cv, skills });
                }}
              />
            </Field>
          </div>
        ))}
        <Button
          variant="outline"
          onClick={() =>
            update({ ...cv, skills: [...cv.skills, { category: "", items: [] }] })
          }
        >
          <Plus data-icon="inline-start" />
          {labels.addSkillGroup}
        </Button>
      </TabsContent>

      <TabsContent value="projects" className="mt-4 space-y-4">
        {(cv.projects ?? []).map((project, index) => (
          <div key={project.id} className="space-y-3 rounded-xl border border-border bg-muted/25 p-4">
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={labels.delete}
                onClick={() =>
                  update({
                    ...cv,
                    projects: (cv.projects ?? []).filter((_, i) => i !== index),
                  })
                }
              >
                <Trash2 />
              </Button>
            </div>
            <Field label={labels.projectName}>
              <Input
                value={project.name}
                onChange={(e) => {
                  const projects = [...(cv.projects ?? [])];
                  projects[index] = { ...project, name: e.target.value };
                  update({ ...cv, projects });
                }}
              />
            </Field>
            <Field label={labels.description}>
              <Textarea
                value={project.description}
                onChange={(e) => {
                  const projects = [...(cv.projects ?? [])];
                  projects[index] = { ...project, description: e.target.value };
                  update({ ...cv, projects });
                }}
              />
            </Field>
            <Field label={labels.link}>
              <Input
                value={project.link ?? ""}
                onChange={(e) => {
                  const projects = [...(cv.projects ?? [])];
                  projects[index] = { ...project, link: e.target.value };
                  update({ ...cv, projects });
                }}
              />
            </Field>
            <Field label={labels.technologies}>
              <Input
                value={project.technologies.join(", ")}
                onChange={(e) => {
                  const projects = [...(cv.projects ?? [])];
                  projects[index] = {
                    ...project,
                    technologies: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  };
                  update({ ...cv, projects });
                }}
              />
            </Field>
          </div>
        ))}
        <Button
          variant="outline"
          onClick={() =>
            update({ ...cv, projects: [...(cv.projects ?? []), newProject()] })
          }
        >
          <Plus data-icon="inline-start" />
          {labels.addProject}
        </Button>
      </TabsContent>

      <TabsContent value="certs" className="mt-4 space-y-4">
        {(cv.certifications ?? []).map((cert, index) => (
          <div key={`cert-${index}`} className="grid gap-3 rounded-xl border border-border bg-muted/25 p-4">
            <Field label={labels.certName}>
              <Input
                value={cert.name}
                onChange={(e) => {
                  const certifications = [...(cv.certifications ?? [])];
                  certifications[index] = { ...cert, name: e.target.value };
                  update({ ...cv, certifications });
                }}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={labels.issuer}>
                <Input
                  value={cert.issuer}
                  onChange={(e) => {
                    const certifications = [...(cv.certifications ?? [])];
                    certifications[index] = { ...cert, issuer: e.target.value };
                    update({ ...cv, certifications });
                  }}
                />
              </Field>
              <Field label={labels.date}>
                <Input
                  value={cert.date}
                  placeholder={labels.datePlaceholder}
                  onChange={(e) => {
                    const certifications = [...(cv.certifications ?? [])];
                    certifications[index] = { ...cert, date: e.target.value };
                    update({ ...cv, certifications });
                  }}
                />
              </Field>
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          onClick={() =>
            update({
              ...cv,
              certifications: [
                ...(cv.certifications ?? []),
                { name: "", issuer: "", date: "" },
              ],
            })
          }
        >
          <Plus data-icon="inline-start" />
          {labels.addCert}
        </Button>
      </TabsContent>
    </Tabs>
    </div>
  );
}
