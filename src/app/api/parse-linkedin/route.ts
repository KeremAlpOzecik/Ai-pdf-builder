import { generateCvJson } from "@/lib/gemini";
import type { TargetLanguage } from "@/types/cv";
import { isTargetLanguage, MAX_AI_UPLOAD_BYTES, requestBodyTooLarge, safeServerError } from "@/lib/request-validation";
import { guardAiRequest, hasPdfSignature } from "@/lib/api-guard";

export const runtime = "nodejs";

export async function POST(request: Request) {
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
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const extracted = await parser.getText();
    await parser.destroy();

    const text = extracted.text?.trim() ?? "";
    const prompt =
      `Parse this resume PDF into CVData. Extract only. Do not optimize wording. targetLanguage=${targetLanguage}. Do not invent facts.`;

    const cv =
      text.length > 80
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
    return Response.json({ error: safeServerError(error, "Failed to parse PDF.") }, { status: 500 });
  }
}
