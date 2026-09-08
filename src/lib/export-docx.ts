import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";
import type { CVData, ResumeTemplate } from "@/types/cv";
import { formatCvDate, formatCvDateRange, getCvDocumentLabels } from "@/lib/cv-format";

function bullets(items: string[]) {
  return items.filter(Boolean).map(
    (text) =>
      new Paragraph({
        bullet: { level: 0 },
        children: [new TextRun({ text, size: 20 })],
      })
  );
}

export async function cvToDocxBlob(cv: CVData, template: ResumeTemplate = "modern"): Promise<Blob> {
  const { personalInfo } = cv;
  const labels = getCvDocumentLabels(cv.targetLanguage);
  const headingColor = template === "modern" ? "173F3B" : template === "compact" ? "214B72" : "302A27";
  const headerAlignment = template === "classic" ? AlignmentType.CENTER : AlignmentType.LEFT;
  const contact = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    personalInfo.linkedinUrl,
    personalInfo.githubUrl,
    personalInfo.portfolioUrl,
  ]
    .filter(Boolean)
    .join("  |  ");

  const children: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: headerAlignment,
      children: [new TextRun({ text: personalInfo.fullName || "Curriculum Vitae", bold: true, color: headingColor })],
    }),
    new Paragraph({
      alignment: headerAlignment,
      children: [new TextRun({ text: personalInfo.title, italics: true, size: 22 })],
    }),
    new Paragraph({
      alignment: headerAlignment,
      spacing: { after: 200 },
      children: [new TextRun({ text: contact, size: 18 })],
    }),
  ];

  if (personalInfo.summary) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: labels.summary, color: headingColor })],
      }),
      new Paragraph({ children: [new TextRun({ text: personalInfo.summary, size: 20 })] })
    );
  }

  if (cv.workExperience.length) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: labels.experience, color: headingColor })],
      })
    );
    for (const job of cv.workExperience) {
      const dates = formatCvDateRange(job.startDate, job.endDate, job.current, cv.targetLanguage);
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: job.position, bold: true, size: 22 }),
            new TextRun({ text: job.company ? `  |  ${job.company}` : "", size: 22 }),
          ],
        }),
        new Paragraph({
          children: [new TextRun({ text: [dates, job.location].filter(Boolean).join("  |  "), italics: true, size: 18 })],
        }),
        ...bullets(job.highlights)
      );
    }
  }

  if (cv.education.length) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: labels.education, color: headingColor })],
      })
    );
    for (const edu of cv.education) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: [edu.degree, edu.fieldOfStudy].filter(Boolean).join(labels.in),
              bold: true,
              size: 22,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: [edu.institution, formatCvDateRange(edu.startDate, edu.endDate, false, cv.targetLanguage)]
                .filter(Boolean)
                .join("  |  "),
              size: 20,
            }),
          ],
        })
      );
    }
  }

  if (cv.skills.some((g) => g.items.length)) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: labels.skills, color: headingColor })],
      })
    );
    for (const group of cv.skills) {
      if (!group.items.length) continue;
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${group.category}: `, bold: true, size: 20 }),
            new TextRun({ text: group.items.join(", "), size: 20 }),
          ],
        })
      );
    }
  }

  if (cv.projects?.length) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: labels.projects, color: headingColor })],
      })
    );
    for (const project of cv.projects) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: project.name, bold: true, size: 22 })],
        }),
        new Paragraph({ children: [new TextRun({ text: project.description, size: 20 })] })
      );
      if (project.technologies.length) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: project.technologies.join(", "), italics: true, size: 18 })],
          })
        );
      }
    }
  }

  if (cv.certifications?.length) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: labels.certifications, color: headingColor })],
      })
    );
    for (const cert of cv.certifications) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: [cert.name, cert.issuer, formatCvDate(cert.date, cv.targetLanguage)].filter(Boolean).join("  |  "),
              size: 20,
            }),
          ],
        })
      );
    }
  }

  if (cv.languages?.length) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: labels.languages, color: headingColor })],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: cv.languages
              .map((l) => `${l.language} (${l.proficiency})`)
              .join("  |  "),
            size: 20,
          }),
        ],
      })
    );
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });
  return Packer.toBlob(doc);
}
