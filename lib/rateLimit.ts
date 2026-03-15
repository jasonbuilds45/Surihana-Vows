// ─────────────────────────────────────────────────────────────────────────────
// lib/rateLimit.ts
//
// In-memory, IP-based sliding window rate limiter for Next.js API routes.
//
// Design notes:
//  • Uses a Map keyed by "<limiter-name>:<ip>" to isolate limits per endpoint.
//  • Each entry stores an array of timestamps (ms) within the current window.
//  • Expired timestamps are purged on every check — no background timer needed.
//  • This is a single-instance (per serverless function cold start) store.
//    For multi-region deployments, replace the Map with a Redis/Upstash store.
//  • Memory is bounded: maxRequests entries per key, auto-evicted after windowMs.
// ─────────────────────────────────────────────────────────────────────────────

export interface RateLimitOptions {
  /** Unique identifier for this limiter (e.g. "upload-photo"). */
  name: string;
  /** Max number of requests allowed within the window. */
  maxRequests: number;
  /** Sliding window duration in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  /** True if the request is allowed through. */
  allowed: boolean;
  /** How many requests remain in the current window (0 when blocked). */
  remaining: number;
  /** Unix timestamp (ms) when the oldest request in the window expires. */
  resetAt: number;
}

// Global store — survives across requests within the same serverless instance.
const store = new Map<string, number[]>();

/**
 * Extract the real client IP from a Next.js request.
 * Checks x-forwarded-for (set by Vercel/proxies) before falling back to
 * x-real-ip, then a static fallback for local dev.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for may be a comma-separated list; take the first entry.
    return forwarded.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") ?? "127.0.0.1";
}

/**
 * Check whether the given IP has exceeded the rate limit for this limiter.
 *
 * @example
 * const result = checkRateLimit(request, {
 *   name: "upload-photo",
 *   maxRequests: 10,
 *   windowMs: 10 * 60 * 1000, // 10 minutes
 * });
 * if (!result.allowed) {
 *   return NextResponse.json({ success: false, message: "Too many requests." }, { status: 429 });
 * }
 */
export function checkRateLimit(
  request: Request,
  options: RateLimitOptions
): RateLimitResult {
  const ip = getClientIp(request);
  const key = `${options.name}:${ip}`;
  const now = Date.now();
  const windowStart = now - options.windowMs;

  // Retrieve or initialise the timestamp list for this key.
  const timestamps = store.get(key) ?? [];

  // Purge timestamps that have fallen outside the current window.
  const active = timestamps.filter((t) => t > windowStart);

  const allowed = active.length < options.maxRequests;
  const remaining = Math.max(options.maxRequests - active.length - (allowed ? 1 : 0), 0);
  const resetAt = active.length > 0 ? active[0] + options.windowMs : now + options.windowMs;

  if (allowed) {
    active.push(now);
  }

  store.set(key, active);

  return { allowed, remaining, resetAt };
}

/**
 * Build the standard rate-limit response headers.
 * Add these to any 429 response so clients can implement back-off.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000))
  };
}
