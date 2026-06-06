import { describe, it, expect, vi, beforeEach, afterEach } from 'vite-plus/test'
import { EtsyClient, TokenRepository, TokenDetails } from '@/utilities/etsyClient'

class InMemoryTokenRepository implements TokenRepository {
  public token: TokenDetails | null = null
  public getCalls = 0
  public saveCalls = 0
  public updateCalls = 0

  async getToken(): Promise<TokenDetails | null> {
    this.getCalls++
    return this.token
  }

  async saveToken(accessToken: string, refreshToken: string, expiresIn: number): Promise<void> {
    this.saveCalls++
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()
    this.token = {
      accessToken,
      refreshToken,
      expiresAt,
    }
  }

  async updateToken(id: string | number, tokenDetails: TokenDetails): Promise<void> {
    this.updateCalls++
    this.token = {
      id,
      ...tokenDetails,
    }
  }
}

describe('EtsyClient', () => {
  let tokenRepo: InMemoryTokenRepository
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    tokenRepo = new InMemoryTokenRepository()
    mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ results: [{ id: 1, title: 'Test Product' }] }),
      }),
    )
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('throws error if API credentials are not provided', () => {
    expect(() => new EtsyClient({ apiKey: '', sharedSecret: '' }, tokenRepo)).toThrow(
      /Etsy API credentials missing/,
    )
  })

  it('generates a valid authorization URL containing required parameters', () => {
    const client = new EtsyClient(
      {
        apiKey: 'test-key',
        sharedSecret: 'test-secret',
        redirectUri: 'http://localhost/callback',
      },
      tokenRepo,
    )

    const urlString = client.generateAuthUrl()
    const url = new URL(urlString)

    expect(url.origin).toBe('https://api.etsy.com')
    expect(url.pathname).toBe('/v3/public/oauth/token')
    expect(url.searchParams.get('client_id')).toBe('test-key')
    expect(url.searchParams.get('redirect_uri')).toBe('http://localhost/callback')
    expect(url.searchParams.get('response_type')).toBe('code')
    expect(url.searchParams.get('scope')).toContain('listings_r')
    expect(url.searchParams.get('state')).toBeDefined()
  })

  it('exchanges authorization code and persists the token details', async () => {
    const client = new EtsyClient(
      {
        apiKey: 'test-key',
        sharedSecret: 'test-secret',
        redirectUri: 'http://localhost/callback',
      },
      tokenRepo,
    )

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: 'initial-access',
          refresh_token: 'initial-refresh',
          expires_in: 3600,
        }),
    })

    await client.completeAuthFlow('auth-code')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.etsy.com/v3/public/oauth/token',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: expect.stringContaining('Basic'),
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
      }),
    )
    expect(tokenRepo.saveCalls).toBe(1)
    expect(tokenRepo.token?.accessToken).toBe('initial-access')
    expect(tokenRepo.token?.refreshToken).toBe('initial-refresh')
  })

  it('falls back to credentials key-secret signature header when no OAuth token exists', async () => {
    const client = new EtsyClient(
      {
        apiKey: 'test-key',
        sharedSecret: 'test-secret',
        redirectUri: 'http://localhost/callback',
      },
      tokenRepo,
    )

    await client.request('/shops/123/listings/active')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://openapi.etsy.com/v3/application/shops/123/listings/active',
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-api-key': 'test-key:test-secret',
        }),
      }),
    )
    // Verify bearer auth was not injected
    const fetchArgs = mockFetch.mock.calls[0][1]
    expect(fetchArgs.headers.Authorization).toBeUndefined()
  })

  it('uses the cached Bearer access token when valid and not expiring soon', async () => {
    const client = new EtsyClient(
      {
        apiKey: 'test-key',
        sharedSecret: 'test-secret',
        redirectUri: 'http://localhost/callback',
      },
      tokenRepo,
    )

    tokenRepo.token = {
      accessToken: 'valid-access-token',
      refreshToken: 'valid-refresh-token',
      // Expires in 1 hour
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    }

    await client.request('/shops/123/listings/active')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://openapi.etsy.com/v3/application/shops/123/listings/active',
      expect.objectContaining({
        headers: expect.objectContaining({
          authorization: 'Bearer valid-access-token',
        }),
      }),
    )
    expect(mockFetch).not.toHaveBeenCalledWith(
      expect.stringContaining('/oauth/token'),
      expect.any(Object),
    )
  })

  it('automatically triggers refresh flow when the token is expiring in less than 5 minutes', async () => {
    const client = new EtsyClient(
      {
        apiKey: 'test-key',
        sharedSecret: 'test-secret',
        redirectUri: 'http://localhost/callback',
      },
      tokenRepo,
    )

    tokenRepo.token = {
      id: 'existing-db-id',
      accessToken: 'old-access-token',
      refreshToken: 'old-refresh-token',
      // Expiring in 2 minutes
      expiresAt: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
    }

    // First call to fetch is the refresh POST
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          expires_in: 3600,
        }),
    })

    // Second call is the resource request GET
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ results: [] }),
    })

    await client.request('/shops/123/listings/active')

    // 1. Verify token refresh was invoked
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      'https://api.etsy.com/v3/public/oauth/token',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(URLSearchParams),
      }),
    )

    // 2. Verify resource query was called with the refreshed Bearer token
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      'https://openapi.etsy.com/v3/application/shops/123/listings/active',
      expect.objectContaining({
        headers: expect.objectContaining({
          authorization: 'Bearer new-access-token',
        }),
      }),
    )

    // 3. Verify the updated token details were saved in database
    expect(tokenRepo.updateCalls).toBe(1)
    expect(tokenRepo.token?.accessToken).toBe('new-access-token')
    expect(tokenRepo.token?.refreshToken).toBe('new-refresh-token')
  })
})
