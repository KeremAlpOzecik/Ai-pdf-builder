import type { TargetLanguage } from "@/types/cv";

export const MAX_AI_UPLOAD_BYTES = 25 * 1024 * 1024;
export const MAX_AI_JSON_BYTES = 512 * 1024;

export function isTargetLanguage(value: unknown): value is TargetLanguage {
  return value === "EN" || value === "TR";
}

export function requestBodyTooLarge(request: Request, maxBytes: number) {
  const length = request.headers.get("content-length");
  return length !== null && Number.isFinite(Number(length)) && Number(length) > maxBytes;
}

export function safeServerError(error: unknown, fallback: string) {
  console.error(fallback, { category: error instanceof Error ? error.name : "UnknownError" });
  return fallback;
}

export function aiErrorResponse(error: unknown, fallback: string, language: TargetLanguage) {
  console.error(fallback, { category: error instanceof Error ? error.name : "UnknownError" });
  const details = error && typeof error === "object" ? error as { name?: unknown; message?: unknown } : {};
  const name = typeof details.name === "string" ? details.name : "";
  const message = typeof details.message === "string" ? details.message.toLowerCase() : "";
  if (name === "AI_CONFIGURATION_ERROR") {
    return Response.json({ code: "AI_NOT_CONFIGURED", error: language === "TR" ? "AI hizmeti yapılandırılmamış." : "The AI service is not configured." }, { status: 503 });
  }
  if (name === "AI_EMPTY_CV_ERROR") {
    return Response.json({ code: "CV_CONTENT_INSUFFICIENT", error: language === "TR" ? "Bu dosyadan yeterli CV bilgisi çıkarılamadı." : "Not enough CV information could be extracted from this file." }, { status: 422 });
  }
  if (/timeout|timed out|deadline|abort/.test(message)) {
    return Response.json({ code: "AI_TIMEOUT", error: language === "TR" ? "AI isteği zaman aşımına uğradı. Yeniden deneyin." : "The AI request timed out. Please retry." }, { status: 504 });
  }
  if (/429|rate limit|resource_exhausted|quota/.test(message)) {
    return Response.json({ code: "AI_RATE_LIMIT", error: language === "TR" ? "AI hizmeti şu anda yoğun. Kısa süre sonra yeniden deneyin." : "The AI service is busy. Please retry shortly." }, { status: 429 });
  }
  return Response.json({ code: "AI_PROVIDER_ERROR", error: fallback }, { status: 502 });
}
