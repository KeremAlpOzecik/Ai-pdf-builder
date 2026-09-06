import { Document, Packer, Paragraph, TextRun } from "docx";
import { PDFDocument } from "pdf-lib";
import { openPdf } from "@/lib/pdf/pdfjs-client";
import { embedUiFont } from "@/lib/pdf/ops";

function htmlToParagraphs(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const blocks = [...doc.body.querySelectorAll("p, h1, h2, h3, li, div")];
  const lines =
    blocks.length > 0
      ? blocks.map((el) => el.textContent?.replace(/\s+/g, " ").trim() ?? "").filter(Boolean)
      : [doc.body.textContent?.replace(/\s+/g, " ").trim() ?? ""].filter(Boolean);
  return lines;
}

function wrapLine(text: string, font: { widthOfTextAtSize: (t: string, s: number) => number }, size: number, maxWidth: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

export async function docxToPdf(file: File) {
  const mammoth = await import("mammoth");
  const { value: html } = await mammoth.convertToHtml({
    arrayBuffer: await file.arrayBuffer(),
  });
  const paragraphs = htmlToParagraphs(html);
  const pdf = await PDFDocument.create();
  const font = await embedUiFont(pdf);
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 56;
  const size = 11;
  const lineHeight = 16;
  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const ensureSpace = () => {
    if (y < margin + lineHeight) {
      page = pdf.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
  };

  for (const para of paragraphs) {
    const wrapped = wrapLine(para, font, size, pageWidth - margin * 2);
    for (const line of wrapped) {
      ensureSpace();
      page.drawText(line, { x: margin, y, size, font });
      y -= lineHeight;
    }
    y -= 8;
  }

  return pdf.save();
}

export async function pdfToDocx(file: File) {
  const doc = await openPdf(await file.arrayBuffer());
  const children: Paragraph[] = [];
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (i > 1) {
      children.push(new Paragraph({ children: [new TextRun("")] }));
    }
    children.push(
      new Paragraph({
        children: [new TextRun({ text: text || `Page ${i}`, size: 22 })],
      }),
    );
  }
  const word = new Document({
    sections: [{ children: children.length ? children : [new Paragraph("")] }],
  });
  return Packer.toBlob(word);
}
