import { CV_JSON_SCHEMA } from "@/lib/cv-json-schema";
import { normalizeCv } from "@/lib/normalize-cv";
import { cvHasContent } from "@/lib/cv-utils";
import type { CVData, TargetLanguage } from "@/types/cv";

/** Only transient provider failures and unusable output qualify for fallback. */
export function shouldUseGroq(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const details = error as { status?: number; code?: number; name?: string; message?: string };
  const status = Number(details.status ?? details.code);
  if ([400, 401, 403].includes(status)) return false;
  return status === 429 || status === 404 || status >= 500 ||
    details.name === "AI_EMPTY_CV_ERROR" || details.name === "SyntaxError" ||
    /timeout|timed out|deadline|abort|fetch failed|network|resource_exhausted|quota|overloaded|unavailable|empty model response|429|503/i.test(details.message ?? "");
}

export async function generateGroqAts(options: {
  userPrompt: string;
  instruction: string;
  temperature: number;
  targetLanguage: TargetLanguage;
}): Promise<CVData> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Groq fallback is not configured.");
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(20_000),
    cache: "no-store",
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: options.instruction },
        { role: "user", content: options.userPrompt },
      ],
      temperature: options.temperature,
      max_completion_tokens: 4096,
      response_format: {
        type: "json_schema",
        json_schema: { name: "ats_cv", strict: true, schema: CV_JSON_SCHEMA },
      },
    }),
  });
  // Do not propagate provider bodies, which can include user content.
  if (!response.ok) throw new Error(`Groq request failed (${response.status}).`);
  const result = await response.json() as {
    choices?: { finish_reason?: string; message?: { content?: string; refusal?: string } }[];
  };
  const choice = result.choices?.[0];
  if (choice?.finish_reason !== "stop" || choice.message?.refusal || !choice.message?.content) {
    throw new Error("Groq returned an incomplete response.");
  }
  const cv = normalizeCv(JSON.parse(choice.message.content), options.targetLanguage);
  if (!cvHasContent(cv)) {
    const error = new Error("The model response did not contain enough CV information.");
    error.name = "AI_EMPTY_CV_ERROR";
    throw error;
  }
  return cv;
}
