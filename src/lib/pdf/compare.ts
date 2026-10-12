import { diffWordsWithSpace, type Change } from "diff";
import { openPdf } from "./pdfjs-client";

export type ExtractedPdf = { text: string; emptyPages: number[]; pages: number };
export type PdfComparison = { changes: Change[]; groups: number; additions: number; deletions: number };

// Bound extraction and Myers diff work to keep large documents responsive.
export const MAX_COMPARE_CHARACTERS = 300_000;

export async function extractPdfText(file: File): Promise<ExtractedPdf> {
  const pdf = await openPdf(await file.arrayBuffer());
  try {
    if (pdf.numPages > 300) throw new Error("PDF_COMPARE_LIMIT");
    const pages: string[] = [];
    const emptyPages: number[] = [];
    let length = 0;
    for (let number = 1; number <= pdf.numPages; number++) {
      const page = await pdf.getPage(number);
      try {
        const content = await page.getTextContent();
        let text = "";
        let previousY: number | undefined;
        for (const item of content.items) {
          if (!("str" in item)) continue;
          const y = item.transform[5];
          if (previousY !== undefined && Math.abs(y - previousY) > 3 && !text.endsWith("\n")) text += "\n";
          text += item.str;
          text += item.hasEOL ? "\n" : " ";
          previousY = y;
        }
        text = text.replace(/[\t ]+\n/g, "\n").trim();
        if (!text) emptyPages.push(number);
        length += text.length;
        if (length > MAX_COMPARE_CHARACTERS) throw new Error("PDF_COMPARE_LIMIT");
        pages.push(text);
      } finally {
        page.cleanup();
      }
    }
    return { text: pages.join("\n\n"), emptyPages, pages: pdf.numPages };
  } finally {
    await pdf.loadingTask.destroy();
  }
}

export function summarizeChanges(changes: Change[]): PdfComparison {
  let groups = 0;
  let additions = 0;
  let deletions = 0;
  let inChange = false;
  for (const change of changes) {
    const changed = !!(change.added || change.removed);
    if (changed && !inChange) groups++;
    inChange = changed;
    const words = change.value.match(/\S+/gu)?.length ?? 0;
    if (change.added) additions += words;
    if (change.removed) deletions += words;
  }
  return { changes, groups, additions, deletions };
}

export async function comparePdfTexts(oldText: string, newText: string): Promise<PdfComparison> {
  if (Math.max(oldText.length, newText.length) > MAX_COMPARE_CHARACTERS) throw new Error("PDF_COMPARE_LIMIT");
  const changes = await new Promise<Change[]>((resolve, reject) => {
    diffWordsWithSpace(oldText, newText, {
      timeout: 5000,
      maxEditLength: 20_000,
      callback: result => result ? resolve(result) : reject(new Error("PDF_COMPARE_LIMIT")),
    });
  });
  return summarizeChanges(changes);
}
