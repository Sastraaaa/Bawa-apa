import { NextResponse } from "next/server";
import { reviewRequestSchema, reviewResponseSchema } from "@/lib/ai/schema";
import { generateJson, isGeminiConfigured, reviewPrompt } from "@/lib/ai/gemini";
import { cacheGet, cacheSet, checkRateLimit, clientIp } from "@/lib/ai/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isGeminiConfigured()) {
    return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  }
  if (!checkRateLimit(clientIp(req))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = reviewRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const cacheKey = `review:${JSON.stringify(parsed.data)}`;
  const cached = cacheGet<unknown>(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const raw = await generateJson(
      reviewPrompt(parsed.data.context, parsed.data.items),
    );
    const response = reviewResponseSchema.parse(raw);
    cacheSet(cacheKey, response);
    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "ai_failed" }, { status: 502 });
  }
}
