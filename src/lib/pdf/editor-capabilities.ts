import type { PdfCanvasElement } from "./canvas-types";

export type ExportMode = "standard" | "flattened";
export type CapabilityLevel = "native" | "overlay-only" | "flatten-only" | "unsupported";

export type CapabilityReport = {
  standardAllowed: boolean;
  flattenedAllowed: boolean;
  level: CapabilityLevel;
  reasons: string[];
  objects: Array<{ id: string; pageIndex: number; level: CapabilityLevel }>;
  pages: Array<{ pageIndex: number; level: CapabilityLevel }>;
};

export type PdfSecurityFlags = { encrypted: boolean; signed: boolean };

export function inspectPdfSecurity(bytes: Uint8Array): PdfSecurityFlags {
  const source = new TextDecoder("latin1").decode(bytes);
  return {
    encrypted: /\/Encrypt\b/.test(source),
    signed: /\/ByteRange\s*\[/.test(source) && /\/Contents\s*</.test(source),
  };
}

export function isSourceElementDirty(element: PdfCanvasElement) {
  return element.sourcePristine !== true && (element.sourceOp !== undefined || element.sourceBoxId !== undefined);
}

export function isPersistedElement(element: PdfCanvasElement) {
  return element.sourcePristine !== true;
}

export function analyzeEditorCapabilities(
  edits: Record<string, string>,
  elements: PdfCanvasElement[],
  security: PdfSecurityFlags = { encrypted: false, signed: false },
): CapabilityReport {
  const hasSourceTextChanges = Object.keys(edits).length > 0 || elements.some((element) => element.sourceBoxId && isSourceElementDirty(element));
  const hasSourceGraphicChanges = elements.some((element) => element.sourceOp !== undefined && isSourceElementDirty(element));
  const reasons: string[] = [];
  if (hasSourceTextChanges) reasons.push("Existing PDF text was changed. Open-source standard export cannot safely remove the original text stream.");
  if (hasSourceGraphicChanges) reasons.push("An original PDF graphic was changed. Standard export is blocked to prevent silent page rasterization.");
  if (elements.some((element) => element.type === "text" && (element.bold || element.italic) && /[^\u0000-\u00ff]/.test(element.text))) reasons.push("Styled text contains glyphs outside the embedded font variant. Pixel-perfect export is required to avoid corrupt text extraction.");
  if (elements.some((element) => element.flipX || element.flipY)) reasons.push("Flipped objects currently require pixel-perfect export.");
  if (elements.some((element) => element.type === "text" && (element.letterSpacing ?? 0) !== 0)) reasons.push("Custom letter spacing currently requires pixel-perfect export.");
  if (elements.some((element) => element.type === "text" && Boolean(element.fontDataUrl))) reasons.push("User-uploaded fonts currently require pixel-perfect export.");
  if (elements.some((element) => element.type === "image" && (element.crop || element.filters))) reasons.push("Image crops and filters currently require pixel-perfect export.");
  if (elements.some((element) => element.type === "shape" && ((element.cornerRadius ?? 0) > 0 || Boolean(element.dash?.length)))) reasons.push("Rounded or dashed shapes currently require pixel-perfect export.");
  if (elements.some((element) => element.type === "shape" && element.shape === "ellipse" && element.rotation % 180 !== 0)) reasons.push("Rotated ellipses currently require pixel-perfect export.");
  if (security.encrypted && (Object.keys(edits).length || elements.some(isPersistedElement))) reasons.push("Encrypted PDFs cannot be modified in standard mode.");
  if (security.signed && (Object.keys(edits).length || elements.some(isPersistedElement))) reasons.push("Standard modification would invalidate the PDF's digital signature.");
  const objects = elements.map((element) => {
    const requiresFlatten = isSourceElementDirty(element)
      || Boolean(element.flipX || element.flipY)
      || (element.type === "text" && (Boolean(element.fontDataUrl) || (element.letterSpacing ?? 0) !== 0 || ((element.bold || element.italic) && /[^\u0000-\u00ff]/.test(element.text))))
      || (element.type === "image" && Boolean(element.crop || element.filters))
      || (element.type === "shape" && ((element.cornerRadius ?? 0) > 0 || Boolean(element.dash?.length) || (element.shape === "ellipse" && element.rotation % 180 !== 0)));
    return { id: element.id, pageIndex: element.pageIndex, level: (element.sourcePristine === true ? "native" : requiresFlatten ? "flatten-only" : "overlay-only") as CapabilityLevel };
  });
  const rank: Record<CapabilityLevel, number> = { native: 0, "overlay-only": 1, "flatten-only": 2, unsupported: 3 };
  const pages = [...new Set(objects.map((object) => object.pageIndex))].map((pageIndex) => ({ pageIndex, level: objects.filter((object) => object.pageIndex === pageIndex).map((object) => object.level).sort((a, b) => rank[b] - rank[a])[0] ?? "native" }));
  return {
    standardAllowed: reasons.length === 0,
    flattenedAllowed: true,
    level: reasons.length ? "flatten-only" : elements.some(isPersistedElement) ? "overlay-only" : "native",
    reasons,
    objects,
    pages,
  };
}
