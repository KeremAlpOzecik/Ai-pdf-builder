import type { CVData, TargetLanguage } from "@/types/cv";
import { parseLocalCvText } from "@/lib/local-cv-parser";

export interface LocalImportResult { cv: CVData; text: string; }
export const LOCAL_IMPORT_TR = "CV içeriği cihazında okunur; sunucuya veya AI sağlayıcılarına gönderilmez. Alanlar taslak olarak doldurulur. Tarihleri, bölüm sırasını ve eksik bilgileri kontrol et. Otomatik çeviri yapılmaz.";
export const LOCAL_IMPORT_EN = "CV content is read on your device, without upload to our server or AI providers. Fields are filled as a draft. Check dates, section order and missing details. Content is not translated.";

export async function parseCvFile(files: File | File[], kind: "pdf" | "image", targetLanguage: TargetLanguage, progress?: (message: string) => void): Promise<LocalImportResult> {
  const selected = Array.isArray(files) ? files : [files];
  const tr = targetLanguage === "TR";
  if (!selected.length || selected.some(file => !file.size)) throw new Error(tr ? "Boş dosya okunamaz." : "Cannot read an empty file.");
  if (selected.length > (kind === "pdf" ? 1 : 5) || selected.reduce((sum, file) => sum + file.size, 0) > 25 * 1024 * 1024) throw new Error(tr ? "En fazla 1 PDF veya 5 görsel, toplam 25 MB seç." : "Choose at most 1 PDF or 5 images, up to 25 MB total.");
  let worker: Awaited<ReturnType<typeof import("tesseract.js")["createWorker"]>> | undefined;
  const texts: string[] = [];
  async function recognize(image: HTMLCanvasElement) {
    if (!worker) {
      progress?.(tr ? "Cihazda metin okuma hazırlanıyor…" : "Preparing on-device text recognition…");
      const { createWorker } = await import("tesseract.js");
      worker = await createWorker("tur+eng", 1, {
        workerPath: "/ocr/worker.min.js", corePath: "/ocr/core", langPath: "/ocr/lang",
        logger: ({ status, progress: value }) => {
          if (status === "recognizing text") progress?.(`${tr ? "Görseldeki yazılar okunuyor" : "Reading image text"}: ${Math.round(value * 100)}%`);
        },
      });
    }
    return (await worker.recognize(image)).data.text;
  }
  try {
    if (kind === "pdf") {
      const bytes = await selected[0].arrayBuffer();
      if (!new TextDecoder().decode(bytes.slice(0, 1024)).includes("%PDF-")) throw new Error(tr ? "Geçerli bir PDF seç." : "Choose a valid PDF.");
      const { openPdf, renderPageToCanvas } = await import("@/lib/pdf/pdfjs-client");
      const pdf = await openPdf(bytes);
      try {
        if (pdf.numPages > 5) throw new Error(tr ? "CV en fazla 5 sayfa olabilir." : "A CV may contain at most 5 pages.");
        for (let n = 1; n <= pdf.numPages; n++) {
          progress?.(tr ? `Sayfa ${n}/${pdf.numPages} okunuyor…` : `Reading page ${n}/${pdf.numPages}…`);
          const page = await pdf.getPage(n);
          const content = await page.getTextContent();
          let text = "";
          let lastY: number | undefined;
          for (const item of content.items) {
            if (!("str" in item)) continue;
            if (lastY !== undefined && Math.abs(item.transform[5] - lastY) > 3) {
              if (!text.endsWith("\n")) text += "\n";
              if (Math.abs(item.transform[5] - lastY) > Math.max(18, item.height * 1.8)) text += "\n";
            }
            text += `${item.str}${item.hasEOL ? "\n" : " "}`;
            lastY = item.transform[5];
          }
          if (text.replace(/\s/g, "").length < 30) {
            const viewport = page.getViewport({ scale: 1 });
            const scale = Math.min(2, 2200 / Math.max(viewport.width, viewport.height));
            const canvas = await renderPageToCanvas(page, scale);
            try { text = await recognize(canvas); } finally { canvas.width = canvas.height = 0; }
          }
          texts.push(text);
          page.cleanup();
        }
      } finally { await pdf.loadingTask.destroy(); }
    } else {
      for (const file of selected) {
        if (!/\.(png|jpe?g|webp)$/iu.test(file.name)) throw new Error(tr ? "PNG, JPEG veya WebP seç." : "Choose PNG, JPEG or WebP.");
        const url = URL.createObjectURL(file);
        const image = new Image();
        try {
          image.src = url;
          await image.decode();
          if (image.naturalWidth * image.naturalHeight > 40_000_000) throw new Error(tr ? "Görsel çok büyük; çözünürlüğünü azalt." : "Image too large; reduce its resolution.");
          const scale = Math.min(1, 2800 / Math.max(image.naturalWidth, image.naturalHeight));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
          try {
            const context = canvas.getContext("2d");
            if (!context) throw new Error("Canvas unavailable");
            context.fillStyle = "white";
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            texts.push(await recognize(canvas));
          } finally { canvas.width = canvas.height = 0; }
        } finally { URL.revokeObjectURL(url); }
      }
    }
    const text = texts.join("\n\n").trim();
    if (text.replace(/\s/g, "").length < 30) throw new Error(tr ? "Yeterli metin okunamadı. Daha net bir görsel seç veya formu elle doldur." : "Not enough text could be read. Choose a clearer image or fill the form manually.");
    progress?.(tr ? "Düzenlenebilir taslak hazırlanıyor…" : "Preparing an editable draft…");
    return { cv: parseLocalCvText(text, targetLanguage), text };
  } finally { await worker?.terminate(); }
}
