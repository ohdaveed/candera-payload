import { describe, it, expect } from 'vite-plus/test'
import crypto from 'node:crypto'
import { generateCodeVerifier, deriveCodeChallenge } from '@/utilities/pkce'

describe('PKCE helpers', () => {
  it('generateCodeVerifier returns a base64url string of sufficient length', () => {
    const verifier = generateCodeVerifier()
    expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/)
    // RFC 7636 requires 43–128 chars; 32 random bytes base64url-encoded = 43.
    expect(verifier.length).toBeGreaterThanOrEqual(43)
  })

  it('deriveCodeChallenge is the base64url-encoded SHA-256 of the verifier (S256)', () => {
    const verifier = 'test-verifier-123'
    const expected = crypto.createHash('sha256').update(verifier).digest('base64url')
    const challenge = deriveCodeChallenge(verifier)
    expect(challenge).toBe(expected)
    // base64url must not contain +, /, or = padding.
    expect(challenge).not.toMatch(/[+/=]/)
  })

  it('produces distinct verifiers on each call', () => {
    expect(generateCodeVerifier()).not.toBe(generateCodeVerifier())
  })
})
