import { generateCvJson } from "@/lib/gemini";
import { normalizeCv } from "@/lib/normalize-cv";
import type { CVData, TargetLanguage } from "@/types/cv";
import { isTargetLanguage, MAX_AI_JSON_BYTES, requestBodyTooLarge, safeServerError } from "@/lib/request-validation";
import { guardAiRequest } from "@/lib/api-guard";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const blocked = guardAiRequest(request);
    if (blocked) return blocked;
    if (requestBodyTooLarge(request, MAX_AI_JSON_BYTES)) {
      return Response.json({ error: "Request payload is too large." }, { status: 413 });
    }
    const body = (await request.json()) as {
      cv?: CVData;
      targetLanguage?: TargetLanguage;
    };
    if (!body.cv) {
      return Response.json({ error: "cv payload is required." }, { status: 400 });
    }
    const requestedLanguage = body.targetLanguage ?? body.cv.targetLanguage;
    const targetLanguage = isTargetLanguage(requestedLanguage) ? requestedLanguage : "EN";
    const source = normalizeCv(body.cv, targetLanguage);

    const cv = await generateCvJson({
      mode: "enhance",
      targetLanguage,
      temperature: 0.3,
      userPrompt: `Rewrite this CV for ATS. Keep facts identical. Strengthen action verbs and measurable impact in highlights and summary. targetLanguage=${targetLanguage}.

${JSON.stringify(source)}`,
    });

    return Response.json({ cv });
  } catch (error) {
    return Response.json({ error: safeServerError(error, "ATS enhancement failed.") }, { status: 500 });
  }
}
