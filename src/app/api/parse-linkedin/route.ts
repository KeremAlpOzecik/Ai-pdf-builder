import { generateCvJson } from "@/lib/gemini";
import type { TargetLanguage } from "@/types/cv";
import { aiErrorResponse, isTargetLanguage, MAX_AI_UPLOAD_BYTES, requestBodyTooLarge } from "@/lib/request-validation";
import { guardAiRequest, hasPdfSignature } from "@/lib/api-guard";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let responseLanguage: TargetLanguage = "EN";
  try {
    const blocked = guardAiRequest(request);
    if (blocked) return blocked;
    if (requestBodyTooLarge(request, MAX_AI_UPLOAD_BYTES)) {
      return Response.json({ error: "Uploaded file is too large." }, { status: 413 });
    }
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return Response.json({ error: "A valid multipart upload is required." }, { status: 400 });
    }
    const file = form.get("file");
    const requestedLanguage = form.get("targetLanguage");
    const targetLanguage: TargetLanguage = isTargetLanguage(requestedLanguage) ? requestedLanguage : "EN";
    responseLanguage = targetLanguage;
    if (!(file instanceof File)) {
      return Response.json({ error: "PDF file is required." }, { status: 400 });
    }
    if (file.size > MAX_AI_UPLOAD_BYTES) {
      return Response.json({ error: "Uploaded file is too large." }, { status: 413 });
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return Response.json({ error: "Only PDF files are accepted." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!hasPdfSignature(new Uint8Array(buffer))) {
      return Response.json({ error: "The uploaded PDF could not be validated." }, { status: 400 });
    }
    const pdfParse = (await import("pdf-parse")).default;
    let text = "";
    try {
      const extracted = await pdfParse(buffer);
      text = extracted.text?.trim() ?? "";
    } catch {
      // The legacy parser rejects valid object streams. PDF.js handles those and
      // avoids sending a whole binary document when selectable text is available.
      const { PDFDocument } = await import("pdf-lib");
      await PDFDocument.load(buffer);
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const loading = pdfjs.getDocument({ data: new Uint8Array(buffer), useSystemFonts: true });
      const document = await loading.promise;
      try {
        const pages: string[] = [];
        for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
          const content = await (await document.getPage(pageNumber)).getTextContent();
          pages.push(content.items.map((item) => "str" in item ? item.str : "").join(" "));
        }
        text = pages.join("\n").trim();
      } finally {
        await loading.destroy();
      }
      console.info("CV import: recovered selectable text with PDF.js after legacy extraction failed.");
    }
    const prompt =
      `Parse this resume PDF into CVData. Extract only. Do not optimize wording. targetLanguage=${targetLanguage}. Do not invent facts.`;

    const cv =
      text.length > 20
        ? await generateCvJson({
            mode: "parse",
            targetLanguage,
            temperature: 0.1,
            userPrompt: `${prompt}\n\n${text.slice(0, 60000)}`,
          })
        : await generateCvJson({
            mode: "parse",
            targetLanguage,
            temperature: 0.1,
            userPrompt: prompt,
            parts: [
              {
                inlineData: {
                  mimeType: "application/pdf",
                  data: buffer.toString("base64"),
                },
              },
            ],
          });

    return Response.json({ cv });
  } catch (error) {
    return aiErrorResponse(error, responseLanguage === "TR" ? "PDF içe aktarılamadı." : "Failed to parse PDF.", responseLanguage);
  }
}
