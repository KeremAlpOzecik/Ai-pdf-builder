import { guardAiRequest } from "@/lib/api-guard";

// Legacy clients must never send documents onward, even if credentials exist.
export async function POST(request: Request) {
  return guardAiRequest(request) ?? Response.json({ code: "AI_REMOVED", error: "Cloud CV processing is unavailable. Use browser-only import." }, { status: 410 });
}
