/**
 * In-Memory Rate Limiter — Zero Trust API Gateway
 *
 * Applies per-IP sliding-window rate limits to protect against:
 *  - Brute-force attacks on auth endpoints
 *  - Payment endpoint abuse
 *  - API scraping
 *  - DDoS amplification
 *
 * In production: swap this backing store with Redis using
 * the existing paymentRedis client (INCR + EXPIRE pattern).
 *
 * Limits by endpoint category:
 *   auth       → 10 req / 15 min
 *   payments   → 20 req / 1 min
 *   rfq        → 30 req / 1 min
 *   search     → 60 req / 1 min
 *   general    → 120 req / 1 min
 */

interface RateWindow {
  count: number;
  resetAt: number;
}

type RateLimitTier =
  | "auth"
  | "payments"
  | "rfq"
  | "search"
  | "uploads"
  | "general";

const LIMITS: Record<RateLimitTier, { max: number; windowMs: number }> = {
  auth:     { max: 10,  windowMs: 15 * 60 * 1000 },  // 10 / 15 min
  payments: { max: 20,  windowMs: 60 * 1000 },         // 20 / min
  rfq:      { max: 30,  windowMs: 60 * 1000 },         // 30 / min
  search:   { max: 60,  windowMs: 60 * 1000 },         // 60 / min
  uploads:  { max: 10,  windowMs: 60 * 1000 },         // 10 / min
  general:  { max: 120, windowMs: 60 * 1000 },         // 120 / min
};

const store = new Map<string, RateWindow>();

/** Determines the rate limit tier based on the request path */
function classifyPath(path: string): RateLimitTier {
  if (path.startsWith("/api/v1/auth")) return "auth";
  if (path.startsWith("/api/v1/payments")) return "payments";
  if (path.startsWith("/api/v1/rfq")) return "rfq";
  if (path.includes("/search")) return "search";
  if (path.includes("/upload")) return "uploads";
  return "general";
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  tier: RateLimitTier;
}

/**
 * Checks and increments the rate limit counter for a given IP + path.
 * Returns allowed=false when the limit is exceeded.
 */
export function checkRateLimit(ip: string, path: string): RateLimitResult {
  const tier = classifyPath(path);
  const { max, windowMs } = LIMITS[tier];
  const key = `${ip}::${tier}`;
  const now = Date.now();

  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    // New or expired window
    const window: RateWindow = { count: 1, resetAt: now + windowMs };
    store.set(key, window);
    return { allowed: true, remaining: max - 1, resetAt: window.resetAt, tier };
  }

  existing.count += 1;
  store.set(key, existing);

  if (existing.count > max) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt, tier };
  }

  return { allowed: true, remaining: max - existing.count, resetAt: existing.resetAt, tier };
}

/** Purges expired windows (call periodically in production) */
export function purgeExpiredWindows(): void {
  const now = Date.now();
  for (const [key, window] of store.entries()) {
    if (window.resetAt <= now) store.delete(key);
  }
}
