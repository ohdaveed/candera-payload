import { describe, it, expect, vi, beforeEach, afterEach } from 'vite-plus/test'
import { etsyOAuthInitEndpoint, etsyOAuthCallbackEndpoint } from '@/endpoints/etsy'

// The OAuth handlers expect a Payload request; tests pass a minimal stub.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const callInit = (req: any) => etsyOAuthInitEndpoint.handler(req)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const callCallback = (req: any) => etsyOAuthCallbackEndpoint.handler(req)

const getCookie = (header: string | null, name: string): string | undefined => {
  if (!header) return undefined
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return v.join('=')
  }
  return undefined
}

describe('Etsy OAuth state (CSRF) handling', () => {
  beforeEach(() => {
    vi.stubEnv('ETSY_API_KEY', 'test-key')
    vi.stubEnv('ETSY_SHARED_SECRET', 'test-secret')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('init sets an HttpOnly state cookie matching the state in the redirect URL', async () => {
    const res = await callInit({
      user: { id: 1 },
      url: 'http://localhost:3000/api/etsy/oauth/init',
      headers: new Headers(),
    })

    expect(res.status).toBe(302)

    const location = res.headers.get('location')
    expect(location).toBeTruthy()
    const urlState = new URL(location!).searchParams.get('state')
    expect(urlState).toBeTruthy()

    const setCookie = res.headers.get('set-cookie')
    expect(setCookie).toBeTruthy()
    expect(setCookie).toContain('HttpOnly')
    expect(setCookie).toContain('SameSite=Lax')
    expect(getCookie(setCookie, 'etsy_oauth_state')).toBe(urlState)
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

  it('callback proceeds and clears the cookie when the state matches', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: 'access',
          refresh_token: 'refresh',
          expires_in: 3600,
        }),
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
      headers: new Headers([['cookie', 'etsy_oauth_state=match']]),
      payload,
    })

    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toContain('/admin')
    expect(res.headers.get('set-cookie')).toContain('Max-Age=0')
    // The token exchange was reached (state passed validation).
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.etsy.com/v3/public/oauth/token',
      expect.objectContaining({ method: 'POST' }),
    )
  })
})
