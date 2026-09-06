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
    if (!body.cv || !isTargetLanguage(body.targetLanguage)) {
      return Response.json(
        { error: "cv and targetLanguage are required." },
        { status: 400 }
      );
    }
    const source = normalizeCv(body.cv, body.targetLanguage);
    const cv = await generateCvJson({
      mode: "translate",
      targetLanguage: body.targetLanguage,
      temperature: 0.1,
      userPrompt: `Translate every user-facing string in this CVData JSON into ${body.targetLanguage === "TR" ? "Turkish" : "English"}. Preserve URLs, emails, phone numbers, ids, dates, and proper nouns when they are names of companies or people. Set targetLanguage to ${body.targetLanguage}.

${JSON.stringify(source)}`,
    });

    return Response.json({ cv });
  } catch (error) {
    return Response.json({ error: safeServerError(error, "Translation failed.") }, { status: 500 });
  }
}
