import { describe, it, expect, vi, beforeEach, afterEach } from 'vite-plus/test'
import { etsyOAuthInitEndpoint, etsyOAuthCallbackEndpoint } from '@/endpoints/etsy'
import { deriveCodeChallenge } from '@/utilities/pkce'

// The OAuth handlers expect a Payload request; tests pass a minimal stub.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const callInit = (req: any) => etsyOAuthInitEndpoint.handler(req)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const callCallback = (req: any) => etsyOAuthCallbackEndpoint.handler(req)

// Each Set-Cookie as its own string (get('set-cookie') would join them ambiguously).
const setCookies = (res: Response): string[] => res.headers.getSetCookie?.() ?? []

const getCookie = (cookies: string[], name: string): string | undefined => {
  for (const cookie of cookies) {
    const [pair] = cookie.split(';')
    const [k, ...v] = pair.trim().split('=')
    if (k === name) return v.join('=')
  }
  return undefined
}

const cookieNamed = (cookies: string[], name: string): string | undefined =>
  cookies.find((c) => c.trim().startsWith(`${name}=`))

describe('Etsy OAuth authorize + state/PKCE handling', () => {
  beforeEach(() => {
    vi.stubEnv('ETSY_API_KEY', 'test-key')
    vi.stubEnv('ETSY_SHARED_SECRET', 'test-secret')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('init redirects to the Etsy consent URL with state + S256 PKCE challenge', async () => {
    const res = await callInit({
      // The endpoint is admin-gated (userIsAdmin checks the roles field).
      user: { id: 1, roles: ['admin'] },
      url: 'http://localhost:3000/api/etsy/oauth/init',
      headers: new Headers(),
    })

    expect(res.status).toBe(302)

    const location = res.headers.get('location')
    expect(location).toBeTruthy()
    const authUrl = new URL(location!)
    expect(authUrl.origin + authUrl.pathname).toBe('https://www.etsy.com/oauth/connect')
    expect(authUrl.searchParams.get('response_type')).toBe('code')
    expect(authUrl.searchParams.get('code_challenge_method')).toBe('S256')

    const urlState = authUrl.searchParams.get('state')
    const urlChallenge = authUrl.searchParams.get('code_challenge')
    expect(urlState).toBeTruthy()
    expect(urlChallenge).toBeTruthy()

    const cookies = setCookies(res)
    // State cookie matches the state on the URL.
    expect(getCookie(cookies, 'etsy_oauth_state')).toBe(urlState)
    const stateCookie = cookieNamed(cookies, 'etsy_oauth_state')!
    expect(stateCookie).toContain('HttpOnly')
    expect(stateCookie).toContain('SameSite=Lax')

    // The challenge on the URL is the S256 hash of the verifier we stored.
    const verifier = getCookie(cookies, 'etsy_oauth_verifier')
    expect(verifier).toBeTruthy()
    expect(deriveCodeChallenge(verifier!)).toBe(urlChallenge)
  })

  it('callback returns 400 when the state cookie is missing', async () => {
    const res = await callCallback({
      url: 'http://localhost:3000/api/etsy/oauth/callback?code=auth-code&state=abc123',
      headers: new Headers(),
    })
    expect(res.status).toBe(400)
  })

  it('callback returns 400 when the state param and cookie do not match', async () => {
    const res = await callCallback({
      url: 'http://localhost:3000/api/etsy/oauth/callback?code=auth-code&state=abc123',
      headers: new Headers([['cookie', 'etsy_oauth_state=different']]),
    })
    expect(res.status).toBe(400)
  })

  it('callback returns 400 when the PKCE verifier cookie is missing', async () => {
    const res = await callCallback({
      url: 'http://localhost:3000/api/etsy/oauth/callback?code=auth-code&state=match',
      headers: new Headers([['cookie', 'etsy_oauth_state=match']]),
    })
    expect(res.status).toBe(400)
  })

  it('callback exchanges the code with the PKCE verifier, then clears both cookies', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ access_token: 'access', refresh_token: 'refresh', expires_in: 3600 }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const payload = {
      find: vi.fn().mockResolvedValue({ docs: [] }),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      delete: vi.fn(),
      logger: { error: vi.fn() },
    }

    const res = await callCallback({
      url: 'http://localhost:3000/api/etsy/oauth/callback?code=auth-code&state=match',
      headers: new Headers([['cookie', 'etsy_oauth_state=match; etsy_oauth_verifier=my-verifier']]),
      payload,
    })

    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toContain('/admin')

    const cookies = setCookies(res)
    const stateClear = cookieNamed(cookies, 'etsy_oauth_state')
    const verifierClear = cookieNamed(cookies, 'etsy_oauth_verifier')
    expect(stateClear).toContain('Max-Age=0')
    expect(verifierClear).toContain('Max-Age=0')

    // The token POST carried the verifier from the cookie.
    const tokenCall = mockFetch.mock.calls.find(
      ([u]) => u === 'https://api.etsy.com/v3/public/oauth/token',
    )
    expect(tokenCall).toBeTruthy()
    const body = tokenCall![1].body as URLSearchParams
    expect(body.get('code_verifier')).toBe('my-verifier')
    expect(body.get('grant_type')).toBe('authorization_code')
  })
})
