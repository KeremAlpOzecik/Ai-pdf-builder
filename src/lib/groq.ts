import { CV_JSON_SCHEMA } from "@/lib/cv-json-schema";
import { normalizeCv } from "@/lib/normalize-cv";
import { cvHasContent } from "@/lib/cv-utils";
import type { CVData, TargetLanguage } from "@/types/cv";

export async function generateGroqCv(options: {
  parts?: { inlineData: { mimeType: string; data: string } }[];
  userPrompt: string;
  instruction: string;
  temperature: number;
  targetLanguage: TargetLanguage;
}): Promise<CVData> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    const error = new Error("AI service is not configured.");
    error.name = "AI_CONFIGURATION_ERROR";
    throw error;
  }
  const images = options.parts ?? [];
  if (images.length > 3 || images.some(part => !/^image\/(png|jpeg|webp)$/.test(part.inlineData.mimeType))) throw new Error("Unsupported AI image input.");
  const vision = images.length > 0;
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(40_000),
    cache: "no-store",
    body: JSON.stringify({
      model: vision ? (process.env.GROQ_VISION_MODEL || "qwen/qwen3.8-27b") : (process.env.GROQ_MODEL || "openai/gpt-oss-120b"),
      messages: [
        { role: "system", content: options.instruction + (vision ? `\nReturn JSON matching this schema: ${JSON.stringify(CV_JSON_SCHEMA)}` : "") },
        { role: "user", content: vision ? [{ type: "text", text: options.userPrompt }, ...images.map(part => ({ type: "image_url", image_url: { url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` } }))] : options.userPrompt },
      ],
      temperature: options.temperature,
      max_completion_tokens: 4096,
      response_format: vision ? { type: "json_object" } : {
        type: "json_schema",
        json_schema: { name: "cv", strict: true, schema: CV_JSON_SCHEMA },
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
