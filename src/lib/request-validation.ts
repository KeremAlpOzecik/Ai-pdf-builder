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
  console.error(fallback, error);
  return fallback;
}
