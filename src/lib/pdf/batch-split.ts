import { PDFDocument } from "pdf-lib";
import { stem } from "../download";
import type { BatchOutput } from "../batch-zip";

export async function splitPdfBatch(file: File, selection: { mode: "range" | "every" | "selected"; from: number; to: number; pages: number[] }, report: (percent: number) => void): Promise<BatchOutput[]> {
  // Load the source once, even when exporting hundreds of separate pages.
  const source = await PDFDocument.load(await file.arrayBuffer());
  const count = source.getPageCount();
  if (!count) throw new Error("INVALID_PAGE_RANGE");
  if (selection.mode === "range" && (!Number.isInteger(selection.from) || !Number.isInteger(selection.to) || selection.from < 1 || selection.to > count || selection.to < selection.from)) throw new Error("INVALID_PAGE_RANGE");
  const indices = selection.mode === "selected" ? selection.pages : selection.mode === "every"
    ? Array.from({ length: count }, (_, i) => i + 1)
    : Array.from({ length: Math.max(0, selection.to - selection.from + 1) }, (_, i) => selection.from + i);
  if (!indices.length || indices.some(page => !Number.isInteger(page) || page < 1 || page > count)) throw new Error("INVALID_PAGE_RANGE");
  const groups = selection.mode === "every" ? indices.map(page => [page]) : [indices];
  const outputs: BatchOutput[] = [];
  for (let index = 0; index < groups.length; index++) {
    const output = await PDFDocument.create();
    const pages = await output.copyPages(source, groups[index].map(page => page - 1));
    pages.forEach(page => output.addPage(page));
    const bytes = await output.save();
    outputs.push({ blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), name: `${stem(file.name)}-p${selection.mode === "every" ? groups[index][0] : selection.mode === "selected" ? "selected" : `${selection.from}-${selection.to}`}.pdf` });
    report((index + 1) / groups.length * 100);
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  return outputs;
}
