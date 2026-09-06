export const TOOL_SLUGS = [
  "edit-pdf",
  "word-to-pdf",
  "pdf-to-word",
  "merge",
  "split",
  "compress",
  "jpg-pdf",
] as const;

export type ToolSlug = (typeof TOOL_SLUGS)[number];

export function isToolSlug(value: string): value is ToolSlug {
  return (TOOL_SLUGS as readonly string[]).includes(value);
}

export const MAX_FILE_BYTES = 25 * 1024 * 1024;
