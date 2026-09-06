import { GoogleGenAI } from "@google/genai";
import { CV_JSON_SCHEMA } from "@/lib/cv-json-schema";
import { normalizeCv } from "@/lib/normalize-cv";
import type { CVData, TargetLanguage } from "@/types/cv";

export type GeminiMode = "parse" | "enhance" | "translate";

const INSTRUCTIONS: Record<GeminiMode, string> = {
  parse: `You extract resume data into the given JSON schema.

Rules:
1. Copy the candidate's wording. Do not rewrite for ATS and do not improve style.
2. Normalize dates to 'YYYY-MM' or 'Present'.
3. Do not invent facts. Missing fields stay empty strings or empty arrays.
4. Output language must match targetLanguage ('EN' or 'TR').`,
  enhance: `You are an ATS resume editor. Rewrite the given CV JSON for applicant tracking systems.

Rules:
1. Keep every fact identical: employers, titles, dates, skills, education, links.
2. Rewrite the summary and experience highlights into concise bullets with strong action verbs and measurable impact only when the source implies it.
3. Do not invent employers, degrees, or skills.
4. Output language must match targetLanguage ('EN' or 'TR').`,
  translate: `You translate CV JSON. Do not improve, shorten, or ATS-optimize.

Rules:
1. Translate user-facing strings into the target language.
2. Preserve URLs, emails, phones, ids, dates, and company/people names.
3. Do not invent facts.`,
};

const MODELS = ["gemini-3.7-flash", "gemini-3.6-flash"] as const;

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return new GoogleGenAI({ apiKey });
}

type ContentPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

export async function generateCvJson(options: {
  mode: GeminiMode;
  userPrompt: string;
  parts?: ContentPart[];
  temperature: number;
  targetLanguage: TargetLanguage;
}): Promise<CVData> {
  const ai = getGeminiClient();
  const parts: ContentPart[] = options.parts?.length
    ? options.parts
    : [{ text: options.userPrompt }];

  if (options.parts?.length) {
    parts.unshift({ text: options.userPrompt });
  }

  let lastError: unknown;
  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts }],
        config: {
          systemInstruction: INSTRUCTIONS[options.mode],
          temperature: options.temperature,
          responseMimeType: "application/json",
          responseJsonSchema: CV_JSON_SCHEMA,
        },
      });
      const text = response.text;
      if (!text) throw new Error("Empty model response.");
      const parsed = JSON.parse(text) as unknown;
      return normalizeCv(parsed, options.targetLanguage);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("Gemini request failed.");
}
