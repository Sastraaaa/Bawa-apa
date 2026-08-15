import type { Context, Item } from "@/lib/types";
import { makeItem } from "@/lib/engine/item";
import {
  extractResponseSchema,
  recommendResponseSchema,
  reviewResponseSchema,
  type ExtractRequest,
  type RecommendRequest,
  type ReviewRequest,
} from "./schema";

/**
 * Klien AI Proxy (browser). Selalu boleh gagal: pemanggil wajib punya
 * fallback lokal (ADR 0002 & 0003). Tidak pernah memuat API key.
 */

class AiUnavailableError extends Error {}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new AiUnavailableError("offline");
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new AiUnavailableError(`status ${res.status}`);
  return (await res.json()) as T;
}

export async function aiExtract(text: string): Promise<Context | null> {
  try {
    const req: ExtractRequest = { text };
    const data = await postJson<unknown>("/api/ai/extract", req);
    return extractResponseSchema.parse(data).context;
  } catch {
    return null;
  }
}

export async function aiRecommend(
  context: Context,
  existingItems: string[],
): Promise<Item[]> {
  try {
    const req: RecommendRequest = { context, existingItems };
    const data = await postJson<unknown>("/api/ai/recommend", req);
    const parsed = recommendResponseSchema.parse(data);
    return parsed.items.map((i) => makeItem(i.name, i.priority, "ai", i.reason));
  } catch {
    return [];
  }
}

export async function aiReview(
  context: Context,
  items: string[],
): Promise<string[]> {
  try {
    const req: ReviewRequest = { context, items };
    const data = await postJson<unknown>("/api/ai/review", req);
    return reviewResponseSchema.parse(data).findings;
  } catch {
    return [];
  }
}

export { AiUnavailableError };
