import { PDFDocument } from "pdf-lib";
import type { PdfCanvasElement } from "./canvas-types";
import { exportCanvasPdf } from "./canvas-export";
import { embedUiFont } from "./ops";
import { layoutTextLines } from "./text-layout";

/** Preserve native pages; only pages with an explicit cover are rasterized. */
export async function exportSimplePdf(
  original: Uint8Array,
  elements: PdfCanvasElement[],
) {
  const pdf = await PDFDocument.load(original);
  const fonts = new Map<string, Awaited<ReturnType<typeof embedUiFont>>>();
  for (const element of elements) {
    if (element.type !== "text") continue;
    const page = pdf.getPage(element.pageIndex);
    const sideways = Math.abs(page.getRotation().angle % 180) === 90;
    const pageWidth = sideways ? page.getHeight() : page.getWidth(),
      pageHeight = sideways ? page.getWidth() : page.getHeight();
    const variant = element.bold ? "bold" : "regular";
    let font = fonts.get(variant);
    if (!font) {
      font = await embedUiFont(pdf, variant);
      fonts.set(variant, font);
    }
    const measure = (text: string) =>
      font!.widthOfTextAtSize(text, element.fontSize);
    const lines = layoutTextLines(
      element.text,
      element.width * pageWidth,
      Number.MAX_SAFE_INTEGER,
      element.fontSize,
      1.25,
      measure,
    );
    if (
      lines.length * element.fontSize * 1.25 >
      element.height * pageHeight + 0.5
    )
      throw new Error("TEXT_OVERFLOW");
  }
  const coveredPages = new Set(
    elements
      .filter((element) => element.type === "shape")
      .map((element) => element.pageIndex),
  );
  const nativeElements = elements.filter(
    (element) => !coveredPages.has(element.pageIndex),
  );
  const native = nativeElements.length
    ? await exportCanvasPdf(original, [], {}, nativeElements)
    : original;
  if (!coveredPages.size) return native;
  const { exportFlattenedScenePdf } = await import("./konva-flatten-export");
  return exportFlattenedScenePdf(
    native,
    [],
    {},
    elements.filter((element) => coveredPages.has(element.pageIndex)),
  );
}
