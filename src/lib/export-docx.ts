import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";
import type { CVData } from "@/types/cv";

function bullets(items: string[]) {
  return items.filter(Boolean).map(
    (text) =>
      new Paragraph({
        bullet: { level: 0 },
        children: [new TextRun({ text, size: 20 })],
      })
  );
}

export async function cvToDocxBlob(cv: CVData): Promise<Blob> {
  const { personalInfo } = cv;
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
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: personalInfo.fullName || "Curriculum Vitae", bold: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: personalInfo.title, italics: true, size: 22 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: contact, size: 18 })],
    }),
  ];

  if (personalInfo.summary) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Professional Summary")],
      }),
      new Paragraph({ children: [new TextRun({ text: personalInfo.summary, size: 20 })] })
    );
  }

  if (cv.workExperience.length) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Experience")],
      })
    );
    for (const job of cv.workExperience) {
      const dates = [job.startDate, job.current ? "Present" : job.endDate]
        .filter(Boolean)
        .join(" – ");
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
        children: [new TextRun("Education")],
      })
    );
    for (const edu of cv.education) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: [edu.degree, edu.fieldOfStudy].filter(Boolean).join(" in "),
              bold: true,
              size: 22,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: [edu.institution, `${edu.startDate} – ${edu.endDate}`]
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
        children: [new TextRun("Skills")],
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
        children: [new TextRun("Projects")],
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
        children: [new TextRun("Certifications")],
      })
    );
    for (const cert of cv.certifications) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: [cert.name, cert.issuer, cert.date].filter(Boolean).join("  |  "),
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
        children: [new TextRun("Languages")],
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
