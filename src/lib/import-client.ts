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
  const json = (await res.json().catch(() => ({}))) as { cv?: CVData; error?: string; code?: string };
  if (kind === "pdf" && json.code === "PDF_NEEDS_IMAGES") {
    const { openPdf, renderPageToCanvas } = await import("@/lib/pdf/pdfjs-client");
    const document = await openPdf(await selectedFiles[0].arrayBuffer());
    try {
      if (document.numPages > 3) throw new Error(targetLanguage === "TR" ? "Taranmış CV en fazla 3 sayfa olabilir." : "Scanned CVs may contain at most 3 pages.");
      const images: File[] = [];
      for (let page = 1; page <= document.numPages; page++) {
        const canvas = await renderPageToCanvas(await document.getPage(page), 1.2);
        const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("Image conversion failed")), "image/jpeg", 0.85));
        images.push(new File([blob], `cv-page-${page}.jpg`, { type: "image/jpeg" }));
        canvas.width = canvas.height = 0;
      }
      return parseCvFile(images, "image", targetLanguage);
    } finally { await document.loadingTask.destroy(); }
  }
  if (!res.ok || !json.cv) {
    console.error("CV import failed", res.status);
    throw new Error(json.error || (targetLanguage === "TR" ? "CV içe aktarılamadı. Dosyanızı kontrol edin ve yeniden deneyin." : "CV import failed. Check your file and retry."));
  }
  return json.cv;
}
