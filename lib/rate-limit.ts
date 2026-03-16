/**
 * Rate limiter with Upstash Redis support for serverless.
 * Falls back to in-memory Map when UPSTASH_REDIS_REST_URL is not set (local dev only).
 */

type RateLimitResult = { ok: boolean; remaining: number; resetAt: number };

// ── In-memory fallback (dev only, useless on serverless) ────
type Bucket = { count: number; resetAt: number };
const memStore = new Map<string, Bucket>();

function memConsume(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const current = memStore.get(key);
  if (!current || current.resetAt <= now) {
    memStore.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  if (current.count >= limit) {
    return { ok: false, remaining: 0, resetAt: current.resetAt };
  }
  current.count += 1;
  return { ok: true, remaining: limit - current.count, resetAt: current.resetAt };
}

// ── Upstash Redis sliding-window via REST API ───────────────
async function redisConsume(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const now = Date.now();
  const windowKey = `rl:${key}`;

  // Use pipeline: ZADD + ZREMRANGEBYSCORE + ZCARD + PEXPIRE
  const commands = [
    ['ZREMRANGEBYSCORE', windowKey, '0', String(now - windowMs)],
    ['ZADD', windowKey, String(now), `${now}:${Math.random().toString(36).slice(2, 8)}`],
    ['ZCARD', windowKey],
    ['PEXPIRE', windowKey, String(windowMs)],
  ];

  const res = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });

  if (!res.ok) {
    // Fail open if Redis is unreachable — don't block users
    console.error('[rate-limit] Upstash error:', res.status);
    return { ok: true, remaining: limit, resetAt: now + windowMs };
  }

  const results = await res.json() as Array<{ result: number }>;
  const count = results[2]?.result ?? 0;
  const remaining = Math.max(0, limit - count);

  return { ok: count <= limit, remaining, resetAt: now + windowMs };
}

// ── Public API ──────────────────────────────────────────────
const useRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

export function consumeRateLimit(key: string, limit: number, windowMs: number): RateLimitResult | Promise<RateLimitResult> {
  if (useRedis) return redisConsume(key, limit, windowMs);
  return memConsume(key, limit, windowMs);
}
