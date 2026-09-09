export type TextLineLayout = { text: string; width: number };

/** Canonical line breaker shared by the editor scene and PDF vector export. */
export function layoutTextLines(
  text: string,
  maxWidth: number,
  maxHeight: number,
  fontSize: number,
  lineHeightMultiplier: number,
  measure: (value: string) => number,
): TextLineLayout[] {
  const lines: TextLineLayout[] = [];
  const push = (value: string) => lines.push({ text: value, width: measure(value) });
  for (const paragraph of text.replace(/\r\n?/g, "\n").split("\n")) {
    if (!paragraph) { push(""); continue; }
    const tokens = paragraph.match(/\S+\s*/g) ?? [paragraph];
    let line = "";
    for (const token of tokens) {
      let remainder = token;
      while (remainder) {
        const candidate = line + remainder;
        if (measure(candidate.trimEnd()) <= maxWidth) { line = candidate; break; }
        if (line.trim()) { push(line.trimEnd()); line = ""; continue; }
        let cut = 1;
        while (cut < remainder.length && measure(remainder.slice(0, cut + 1)) <= maxWidth) cut += 1;
        push(remainder.slice(0, cut));
        remainder = remainder.slice(cut);
      }
    }
    if (line || !tokens.length) push(line.trimEnd());
  }
  const capacity = Math.max(1, Math.floor(maxHeight / Math.max(1, fontSize * lineHeightMultiplier)));
  return lines.slice(0, capacity);
}
