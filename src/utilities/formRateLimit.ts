const WINDOW_MS = 60_000
const MAX_SUBMISSIONS_PER_WINDOW = 5

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export function getClientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }

  return headers.get('x-real-ip') || 'unknown'
}

/** Returns false when the client has exceeded the submission window. */
export function checkFormRateLimit(key: string): boolean {
  const now = Date.now()
  const entry = buckets.get(key)

  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }

  if (entry.count >= MAX_SUBMISSIONS_PER_WINDOW) {
    return false
  }

  entry.count += 1
  return true
}
