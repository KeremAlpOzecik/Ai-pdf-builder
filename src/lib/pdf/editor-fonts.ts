import italicUrl from "@fontsource/noto-sans/files/noto-sans-latin-400-italic.woff";
import boldUrl from "@fontsource/noto-sans/files/noto-sans-latin-700-normal.woff";
import boldItalicUrl from "@fontsource/noto-sans/files/noto-sans-latin-700-italic.woff";

export type UiFontVariant = "regular" | "italic" | "bold" | "boldItalic";

export const editorFontUrls: Record<UiFontVariant, string> = {
  regular: "/fonts/NotoSans-Regular.ttf",
  italic: italicUrl,
  bold: boldUrl,
  boldItalic: boldItalicUrl,
};

let browserFontsPromise: Promise<void> | null = null;

export function ensureEditorFonts() {
  if (typeof document === "undefined" || typeof FontFace === "undefined") return Promise.resolve();
  browserFontsPromise ??= Promise.all([
    new FontFace("Noto Sans", `url(${editorFontUrls.italic})`, { style: "italic", weight: "400" }).load(),
    new FontFace("Noto Sans", `url(${editorFontUrls.bold})`, { style: "normal", weight: "700" }).load(),
    new FontFace("Noto Sans", `url(${editorFontUrls.boldItalic})`, { style: "italic", weight: "700" }).load(),
  ]).then((fonts) => { fonts.forEach((font) => document.fonts.add(font)); });
  return browserFontsPromise;
}
