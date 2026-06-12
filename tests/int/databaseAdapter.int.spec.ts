import { describe, expect, it } from 'vite-plus/test'

import { shouldUseVercelPostgresAdapter } from '@/utilities/databaseAdapter'

describe('database adapter selection', () => {
  it('uses the Vercel adapter only for Neon connection strings', () => {
    expect(
      shouldUseVercelPostgresAdapter(
        'postgresql://user:pass@ep-spring-water-aqg2ymy6-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require',
      ),
    ).toBe(true)
    expect(
      shouldUseVercelPostgresAdapter(
        'postgres://user:pass@ep-spring-water-aqg2ymy6.us-east-1.aws.neon.tech/neondb',
      ),
    ).toBe(true)

    expect(shouldUseVercelPostgresAdapter('postgres://postgres@localhost:54320/local')).toBe(false)
    expect(shouldUseVercelPostgresAdapter('postgres://postgres@127.0.0.1:54320/local')).toBe(false)
    expect(shouldUseVercelPostgresAdapter('')).toBe(false)
  })

  it('falls back to the standard adapter for malformed connection strings', () => {
    expect(shouldUseVercelPostgresAdapter('not-a-url')).toBe(false)
    expect(shouldUseVercelPostgresAdapter('neon.tech')).toBe(false)
  })

  it('is not fooled by lookalike hostnames', () => {
    expect(shouldUseVercelPostgresAdapter('postgres://user@evilneon.tech/db')).toBe(false)
    expect(shouldUseVercelPostgresAdapter('postgres://user@neon.tech.evil.com/db')).toBe(false)
  })
})
