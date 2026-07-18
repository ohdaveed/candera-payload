/**
 * Minimal in-memory sliding-window rate limiter for the AI generation
 * endpoints. Per-instance only (serverless instances don't share state), so
 * this is a cheap guard against runaway loops and quota burn, not a hard
 * global quota.
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, number[]>()

  return function isAllowed(key: string, now: number = Date.now()): boolean {
    // Bound memory if many distinct keys accumulate (tiny admin user base in
    // practice) — dropping history only ever errs toward allowing a request.
    if (hits.size > 1_000) hits.clear()

    const windowStart = now - windowMs
    const recent = (hits.get(key) ?? []).filter((timestamp) => timestamp > windowStart)

    if (recent.length >= limit) {
      hits.set(key, recent)
      return false
    }

    recent.push(now)
    hits.set(key, recent)
    return true
  }
}
