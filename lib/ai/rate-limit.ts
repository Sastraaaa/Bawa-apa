import "server-only";

/**
 * Rate-limit per-IP + cache respons sederhana untuk AI Proxy (ADR 0002).
 * In-memory: cukup untuk MVP single-instance. Untuk multi-instance,
 * ganti dengan store bersama (mis. KV) tanpa mengubah antarmuka ini.
 */

const RATE_LIMIT = Number(process.env.AI_RATE_LIMIT_PER_MINUTE ?? 15);
const CACHE_TTL_MS = Number(process.env.AI_CACHE_TTL_SECONDS ?? 300) * 1000;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (bucket.count >= RATE_LIMIT) return false;
  bucket.count += 1;
  return true;
}

type CacheEntry = { value: unknown; expiresAt: number };
const cache = new Map<string, CacheEntry>();

export function cacheGet<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function cacheSet(key: string, value: unknown): void {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
