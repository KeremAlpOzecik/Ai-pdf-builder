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
    const files = form.getAll("file");
    const requestedLanguage = form.get("targetLanguage");
    const targetLanguage: TargetLanguage = isTargetLanguage(requestedLanguage) ? requestedLanguage : "EN";
    if (files.length === 0 || files.some((file) => !(file instanceof File))) {
      return Response.json({ error: "At least one image file is required." }, { status: 400 });
    }
    const imageFiles = files as File[];
    const totalBytes = imageFiles.reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > MAX_AI_UPLOAD_BYTES) {
      return Response.json({ error: "Uploaded images are too large in total." }, { status: 413 });
    }
    if (imageFiles.some((file) => !ALLOWED.has(file.type))) {
      return Response.json({ error: "Only PNG, JPG, and WEBP are accepted." }, { status: 400 });
    }

    const imageParts = await Promise.all(imageFiles.map(async (file) => {
      const mime = file.type === "image/jpg" ? "image/jpeg" : file.type;
      const buffer = Buffer.from(await file.arrayBuffer());
      if (!hasImageSignature(new Uint8Array(buffer), mime)) {
        throw new Error("INVALID_IMAGE");
      }
      return {
        inlineData: {
          mimeType: mime || "image/png",
          data: buffer.toString("base64"),
        },
      };
    }));
    if (imageParts.some((part) => !part.inlineData.data)) {
      return Response.json({ error: "An uploaded image could not be validated." }, { status: 400 });
    }
    const cv = await generateCvJson({
      mode: "parse",
      targetLanguage,
      temperature: 0.1,
      userPrompt: `Extract resume data from these ${imageFiles.length} ordered resume screenshots into one CVData object. The screenshots may be consecutive pages of the same CV. Extract only. Do not optimize wording. targetLanguage=${targetLanguage}. Do not invent facts and do not duplicate content repeated across screenshots.`,
      parts: imageParts,
    });

    return Response.json({ cv });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_IMAGE") {
      return Response.json({ error: "An uploaded image could not be validated." }, { status: 400 });
    }
    return Response.json({ error: safeServerError(error, "Failed to parse image.") }, { status: 500 });
  }
}
