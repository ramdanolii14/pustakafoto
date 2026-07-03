/**
 * Simple in-memory rate limiter.
 * Works per-serverless-instance — not globally consistent across Vercel
 * instances, but effective against single-source abuse and bots.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  limit: number;
  windowSec: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSec: number;
}

export function rateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSec * 1000;
  let entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return { allowed: true, remaining: config.limit - 1, resetAt: entry.resetAt, retryAfterSec: 0 };
  }

  entry.count++;

  if (entry.count > config.limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }

  return { allowed: true, remaining: config.limit - entry.count, resetAt: entry.resetAt, retryAfterSec: 0 };
}

export function getClientIp(req: Request): string {
  const h = req.headers;
  return (
    h.get("cf-connecting-ip") ||
    h.get("x-real-ip") ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export const RATE_LIMITS = {
  auth:    { limit: 10,  windowSec: 600 }, // 10 per 10 min
  write:   { limit: 30,  windowSec: 60  }, // 30 per min
  action:  { limit: 60,  windowSec: 60  }, // 60 per min
  comment: { limit: 10,  windowSec: 60  }, // 10 per min
  read:    { limit: 120, windowSec: 60  }, // 120 per min
  upload:  { limit: 5,   windowSec: 60  }, // 5 per min
  admin:   { limit: 300, windowSec: 60  }, // 300 per min
  export:  { limit: 3,   windowSec: 300 }, // 3 per 5 min
} satisfies Record<string, RateLimitConfig>;

export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: "Too Many Requests",
      message: "Kamu mengirim terlalu banyak permintaan. Coba lagi sebentar.",
      retry_after_seconds: result.retryAfterSec,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(result.retryAfterSec),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
      },
    }
  );
}