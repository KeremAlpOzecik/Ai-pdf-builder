import type { CVData, TargetLanguage } from "@/types/cv";

export async function parseCvFile(
  files: File | File[],
  kind: "pdf" | "image",
  targetLanguage: TargetLanguage
): Promise<CVData> {
  const endpoint = kind === "pdf" ? "/api/parse-linkedin" : "/api/parse-image";
  const form = new FormData();
  const selectedFiles = Array.isArray(files) ? files : [files];
  for (const file of selectedFiles) {
    form.append("file", file);
  }
  form.append("targetLanguage", targetLanguage);
  const res = await fetch(endpoint, { method: "POST", body: form });
  const json = (await res.json()) as { cv?: CVData; error?: string };
  if (!res.ok || !json.cv) {
    throw new Error(json.error || "Import failed");
  }
  return json.cv;
}
