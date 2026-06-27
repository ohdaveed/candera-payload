import crypto from 'node:crypto'

/**
 * PKCE (RFC 7636) helpers for Etsy's OAuth 2.0 authorization-code flow, which
 * requires `code_challenge_method=S256`.
 *
 * Flow: generate a verifier at init, send its S256 challenge on the authorize
 * redirect, then send the verifier itself on the token exchange.
 */

/** A high-entropy, base64url-encoded code verifier (43 chars from 32 bytes). */
export const generateCodeVerifier = (): string => crypto.randomBytes(32).toString('base64url')

/** The S256 code challenge: base64url(SHA-256(verifier)). */
export const deriveCodeChallenge = (verifier: string): string =>
  crypto.createHash('sha256').update(verifier).digest('base64url')
