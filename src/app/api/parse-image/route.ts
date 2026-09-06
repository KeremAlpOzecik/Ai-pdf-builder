import { generateCvJson } from "@/lib/gemini";
import type { TargetLanguage } from "@/types/cv";
import { isTargetLanguage, MAX_AI_UPLOAD_BYTES, requestBodyTooLarge, safeServerError } from "@/lib/request-validation";
import { guardAiRequest, hasImageSignature } from "@/lib/api-guard";

export const runtime = "nodejs";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/jpg"]);

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
      return Response.json({ error: "Image file is required." }, { status: 400 });
    }
    if (file.size > MAX_AI_UPLOAD_BYTES) {
      return Response.json({ error: "Uploaded file is too large." }, { status: 413 });
    }
    const mime = file.type === "image/jpg" ? "image/jpeg" : file.type;
    if (!ALLOWED.has(mime) && !ALLOWED.has(file.type)) {
      return Response.json({ error: "Only PNG, JPG, and WEBP are accepted." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!hasImageSignature(new Uint8Array(buffer), mime)) {
      return Response.json({ error: "The uploaded image could not be validated." }, { status: 400 });
    }
    const cv = await generateCvJson({
      mode: "parse",
      targetLanguage,
      temperature: 0.1,
      userPrompt: `Extract resume data from this screenshot into CVData. Extract only. Do not optimize wording. targetLanguage=${targetLanguage}. Do not invent facts.`,
      parts: [
        {
          inlineData: {
            mimeType: mime || "image/png",
            data: buffer.toString("base64"),
          },
        },
      ],
    });

    return Response.json({ cv });
  } catch (error) {
    return Response.json({ error: safeServerError(error, "Failed to parse image.") }, { status: 500 });
  }
}
