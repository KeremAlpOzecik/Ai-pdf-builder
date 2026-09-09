import type { CVData, TargetLanguage } from "@/types/cv";

export async function parseCvFile(
  files: File | File[],
  kind: "pdf" | "image",
  targetLanguage: TargetLanguage
): Promise<CVData> {
  const endpoint = kind === "pdf" ? "/api/parse-linkedin" : "/api/parse-image";
  const form = new FormData();
  const selectedFiles = Array.isArray(files) ? files : [files];
  if (selectedFiles.reduce((total, file) => total + file.size, 0) > 25 * 1024 * 1024) throw new Error(targetLanguage === "TR" ? "Toplam dosya boyutu 25 MB sınırını aşıyor." : "The combined file size exceeds 25 MB.");
  for (const file of selectedFiles) {
    form.append("file", file);
  }
  form.append("targetLanguage", targetLanguage);
  const res = await fetch(endpoint, { method: "POST", body: form });
  const json = (await res.json()) as { cv?: CVData; error?: string };
  if (!res.ok || !json.cv) {
    console.error("CV import failed", res.status);
    throw new Error(targetLanguage === "TR" ? "CV içe aktarılamadı. Dosyanızı kontrol edin ve yeniden deneyin. AI hizmeti geçici olarak kullanılamıyor olabilir." : "CV import failed. Check your file and retry. The AI service may be temporarily unavailable.");
  }
  return json.cv;
}
