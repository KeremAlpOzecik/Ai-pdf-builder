import { AI_ENABLED, AI_PAUSED_TR } from "@/lib/ai-availability";
import { NextResponse } from "next/server";

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;
const requests = new Map<string, { count: number; resetAt: number }>();

export function guardAiRequest(request: Request) {
  if (!AI_ENABLED) return NextResponse.json({ code: "AI_TEMPORARILY_DISABLED", error: AI_PAUSED_TR }, { status: 503 });
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  let originHost: string | undefined;
  try { originHost = origin ? new URL(origin).host : undefined; } catch { return NextResponse.json({ error: "Invalid origin." }, { status: 403 }); }
  if (originHost && host && originHost !== host) {
    return NextResponse.json({ error: "Cross-origin requests are not allowed." }, { status: 403 });
  }
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "anonymous";
  const now = Date.now();
  // Expired entries must not accumulate for the lifetime of a warm server.
  for (const [client, entry] of requests) if (entry.resetAt <= now) requests.delete(client);
  if (requests.size >= 10_000 && !requests.has(key)) return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
  const current = requests.get(key);
  if (!current || current.resetAt <= now) {
    requests.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }
  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
  }
  current.count += 1;
  return null;
}

export function hasPdfSignature(bytes: Uint8Array) {
  return new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-";
}

export function hasImageSignature(bytes: Uint8Array, mime: string) {
  if (mime === "image/png") return bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (mime === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === "image/webp") return new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  return false;
}
