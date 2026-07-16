const WINDOW_MS = 60_000
const MAX_SUBMISSIONS_PER_WINDOW = 5

/**
 * Rate-limiter seam for form submissions.
 *
 * A durable implementation (Upstash Redis, Vercel WAF/KV — see issue #87)
 * should implement this interface and be installed via setFormRateLimiter()
 * at startup; call sites go through checkFormRateLimit() and don't change.
 */
export interface RateLimiter {
  /** Returns false when the key has exceeded its submission window. */
  check(key: string): boolean | Promise<boolean>
}

type Bucket = { count: number; resetAt: number }

/**
 * Default in-process limiter.
 *
 * LIMITATION (BE-02 / issue #87): state lives in a module-level Map, so on
 * serverless (Vercel) each lambda instance keeps its own buckets — the cap is
 * per-instance, not global, and resets on cold start. It blunts naive loops
 * from a single warm instance but is NOT bot mitigation. The durable fix
 * needs shared infrastructure and is tracked in issue #87.
 */
export class InMemoryRateLimiter implements RateLimiter {
  private buckets = new Map<string, Bucket>()

  constructor(
    private windowMs: number = WINDOW_MS,
    private maxPerWindow: number = MAX_SUBMISSIONS_PER_WINDOW,
  ) {}

  check(key: string): boolean {
    const now = Date.now()
    const entry = this.buckets.get(key)

    if (!entry || now > entry.resetAt) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs })
      return true
    }

    if (entry.count >= this.maxPerWindow) {
      return false
    }

    entry.count += 1
    return true
  }
}

let limiter: RateLimiter = new InMemoryRateLimiter()

/** Install a custom (e.g. durable/shared) limiter implementation. */
export function setFormRateLimiter(custom: RateLimiter): void {
  limiter = custom
}

export function getClientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }

  return headers.get('x-real-ip') || 'unknown'
}

/** Returns false when the client has exceeded the submission window. */
export async function checkFormRateLimit(key: string): Promise<boolean> {
  return await limiter.check(key)
}
