import { GoogleGenAI } from "@google/genai";
import { CV_JSON_SCHEMA } from "@/lib/cv-json-schema";
import { normalizeCv } from "@/lib/normalize-cv";
import { cvHasContent } from "@/lib/cv-utils";
import { generateGroqAts, shouldUseGroq } from "@/lib/groq";
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
const REQUEST_TIMEOUT_MS = 25_000;

/** Accept structured output as well as the fenced JSON occasionally returned by providers. */
export function parseGeminiJson(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Empty model response.");
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    return JSON.parse(unfenced);
  } catch (initialError) {
    const first = unfenced.indexOf("{");
    const last = unfenced.lastIndexOf("}");
    if (first >= 0 && last > first) return JSON.parse(unfenced.slice(first, last + 1));
    throw initialError;
  }
}

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error("AI service is not configured.");
    error.name = "AI_CONFIGURATION_ERROR";
    throw error;
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
  const groqEnabled = options.mode === "enhance" && !!process.env.GROQ_API_KEY && !options.parts?.some(part => "inlineData" in part);
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
          httpOptions: { timeout: groqEnabled ? 10_000 : REQUEST_TIMEOUT_MS },
        },
      });
      const text = response.text;
      if (!text) throw new Error("Empty model response.");
      const parsed = parseGeminiJson(text);
      const cv = normalizeCv(parsed, options.targetLanguage);
      if (!cvHasContent(cv)) {
        const error = new Error("The model response did not contain enough CV information.");
        error.name = "AI_EMPTY_CV_ERROR";
        throw error;
      }
      return cv;
    } catch (error) {
      lastError = error;
      if (groqEnabled) {
        if (!shouldUseGroq(error)) throw error;
        // A shared Gemini quota/availability failure should not delay the independent backup.
        return generateGroqAts({
          userPrompt: options.userPrompt,
          instruction: INSTRUCTIONS.enhance,
          temperature: options.temperature,
          targetLanguage: options.targetLanguage,
        });
      }
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("Gemini request failed.");
}
