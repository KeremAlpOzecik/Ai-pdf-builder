import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, TableLayoutType,
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

  if (cv.skills.some((g) => g.items.length) && template !== "modern") {
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

  if (cv.languages?.length && template !== "modern") {
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

  const sidebarParagraph = (text: string, heading = false) => new Paragraph({
    spacing: { after: heading ? 140 : 100, before: heading ? 260 : 0 },
    children: [new TextRun({ text, color: "F4F0E8", size: heading ? 22 : 18, bold: heading, font: "Arial" })],
  });
  const side = [sidebarParagraph((personalInfo.fullName || "CV").split(/\s+/).slice(0, 2).map(part => part[0]).join(""), true),
    ...[personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.linkedinUrl, personalInfo.githubUrl, personalInfo.portfolioUrl].filter(Boolean).map(value => sidebarParagraph(value!)),
    ...(cv.skills.some(group => group.items.length) ? [sidebarParagraph(labels.skills, true), ...cv.skills.filter(group => group.items.length).flatMap(group => [sidebarParagraph(group.category, true), sidebarParagraph(group.items.join(" · "))])] : []),
    ...(cv.languages?.length ? [sidebarParagraph(labels.languages, true), ...cv.languages.map(language => sidebarParagraph(`${language.language} · ${language.proficiency}`))] : []),
  ];
  const border = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const modernTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED,
    columnWidths: [3500, 6800], borders: { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border },
    rows: [new TableRow({ children: [
      new TableCell({ width: { size: 3500, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: "173F3B" }, margins: { top: 360, bottom: 360, left: 260, right: 260 }, children: side }),
      new TableCell({ width: { size: 6800, type: WidthType.DXA }, margins: { top: 300, bottom: 300, left: 380, right: 300 }, children: children.filter((_, i) => i !== 2) }),
    ] })],
  });
  const doc = new Document({
    styles: { default: { document: { run: { font: "Arial", size: 20 }, paragraph: { spacing: { after: 100, line: 276 } } } } },
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: template === "modern" ? { top: 500, bottom: 500, left: 500, right: 500 } : { top: 800, bottom: 800, left: 800, right: 800 } } }, children: template === "modern" ? [modernTable] : children }],
  });
  return Packer.toBlob(doc);
}
