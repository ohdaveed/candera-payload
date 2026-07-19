import { getPayload, type Payload } from 'payload'
import { etsyLogger } from './logger'

const ETSY_BASE_URL = 'https://openapi.etsy.com/v3/application'
const ETSY_OAUTH_URL = 'https://api.etsy.com/v3/public/oauth'
// User-facing consent page (distinct from the token-exchange endpoint above).
const ETSY_CONNECT_URL = 'https://www.etsy.com/oauth/connect'
// Least privilege: the integration only reads listings (sync) and writes shop
// vacation mode (PUT /shops/{id}), so it needs exactly listings_r, shops_r,
// shops_w. Existing tokens keep their previously granted scopes; a re-run of
// the OAuth flow picks up this narrowed set.
const SCOPES = ['listings_r', 'shops_r', 'shops_w']

export interface EtsyConfig {
  apiKey: string
  sharedSecret: string
  redirectUri: string
}

export interface TokenDetails {
  id?: string | number
  accessToken: string
  refreshToken: string
  expiresAt: string
}

/**
 * Seam for storing and retrieving OAuth tokens.
 * Decouples the client from Payload DB operations during testing.
 */
export interface TokenRepository {
  getToken(): Promise<TokenDetails | null>
  saveToken(accessToken: string, refreshToken: string, expiresIn: number): Promise<void>
  updateToken(id: string | number, tokenDetails: TokenDetails): Promise<void>
}

/**
 * Production implementation of TokenRepository querying Payload's etsy-tokens collection.
 */
export class DefaultPayloadTokenRepository implements TokenRepository {
  private payloadInstance?: Payload

  constructor(payload?: Payload) {
    this.payloadInstance = payload
  }

  private async getPayload() {
    if (!this.payloadInstance) {
      // Imported lazily to avoid a module-load cycle: payload.config imports the
      // Etsy endpoints, which import this client. A top-level config import would
      // make the endpoint modules unimportable in isolation (e.g. in tests).
      const { default: configPromise } = await import('@payload-config')
      this.payloadInstance = await getPayload({ config: configPromise })
    }
    return this.payloadInstance
  }

  async getToken(): Promise<TokenDetails | null> {
    const payload = await this.getPayload()
    const tokens = await payload.find({
      collection: 'etsy-tokens',
      limit: 1,
      sort: '-updatedAt',
    })

    if (!tokens.docs.length) return null
    const doc = tokens.docs[0]

    return {
      id: doc.id,
      accessToken: doc.accessToken,
      refreshToken: doc.refreshToken,
      expiresAt: doc.expiresAt,
    }
  }

  async saveToken(accessToken: string, refreshToken: string, expiresIn: number): Promise<void> {
    const payload = await this.getPayload()

    // Purge any existing tokens to maintain single-token locality
    const existing = await payload.find({
      collection: 'etsy-tokens',
      limit: 100,
    })
    for (const doc of existing.docs) {
      await payload.delete({ collection: 'etsy-tokens', id: doc.id })
    }

    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()
    await payload.create({
      collection: 'etsy-tokens',
      data: {
        accessToken,
        refreshToken,
        expiresAt,
      },
    })
  }

  async updateToken(id: string | number, tokenDetails: TokenDetails): Promise<void> {
    const payload = await this.getPayload()
    await payload.update({
      collection: 'etsy-tokens',
      id,
      data: {
        accessToken: tokenDetails.accessToken,
        refreshToken: tokenDetails.refreshToken,
        expiresAt: tokenDetails.expiresAt,
      },
    })
  }
}

export interface EtsyRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>
}

export class EtsyClient {
  private config: EtsyConfig
  private tokenRepository: TokenRepository

  constructor(config?: Partial<EtsyConfig>, tokenRepository?: TokenRepository) {
    this.config = {
      apiKey: config?.apiKey !== undefined ? config.apiKey : process.env.ETSY_API_KEY || '',
      sharedSecret:
        config?.sharedSecret !== undefined
          ? config.sharedSecret
          : process.env.ETSY_SHARED_SECRET || '',
      redirectUri:
        config?.redirectUri !== undefined
          ? config.redirectUri
          : process.env.ETSY_REDIRECT_URI || '',
    }

    if (!this.config.apiKey || !this.config.sharedSecret) {
      throw new Error(
        'Etsy API credentials missing. Please set ETSY_API_KEY and ETSY_SHARED_SECRET.',
      )
    }

    this.tokenRepository = tokenRepository || new DefaultPayloadTokenRepository()
  }

  /**
   * Builds the authorization page URL for starting the Etsy OAuth 2.0 flow.
   */
  generateAuthUrl(state: string, codeChallenge: string): string {
    const url = new URL(ETSY_CONNECT_URL)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('client_id', this.config.apiKey)
    url.searchParams.set('redirect_uri', this.config.redirectUri)
    url.searchParams.set('scope', SCOPES.join(' '))
    // State is supplied (and persisted) by the caller so it can be validated on
    // the OAuth callback to defend against CSRF.
    url.searchParams.set('state', state)
    // PKCE: Etsy requires the S256 challenge here; the verifier is sent on the
    // token exchange. Both are minted and stored by the caller.
    url.searchParams.set('code_challenge', codeChallenge)
    url.searchParams.set('code_challenge_method', 'S256')

    return url.toString()
  }

  /**
   * Exchanges an authorization callback code for initial tokens and registers them.
   */
  async completeAuthFlow(code: string, codeVerifier: string): Promise<void> {
    // PKCE public-client exchange: authenticated by client_id + code_verifier,
    // not the shared secret — so no Basic auth header here.
    const res = await fetch(`${ETSY_OAUTH_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.config.apiKey,
        redirect_uri: this.config.redirectUri,
        code,
        code_verifier: codeVerifier,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Etsy OAuth token exchange failed (${res.status}): ${body}`)
    }

    const tokenData = await res.json()
    await this.tokenRepository.saveToken(
      tokenData.access_token,
      tokenData.refresh_token,
      tokenData.expires_in,
    )
  }

  /**
   * Performs an out-of-band request to refresh an expiring access token.
   */
  private async refreshAccessToken(refreshToken: string): Promise<{
    access_token: string
    refresh_token: string
    expires_in: number
  }> {
    const res = await fetch(`${ETSY_OAUTH_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.config.apiKey,
        refresh_token: refreshToken,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Etsy OAuth token refresh failed (${res.status}): ${body}`)
    }

    return res.json()
  }

  /**
   * Validates and returns a secure token, refreshing it if within the 5-minute sliding window.
   */
  private async getOrRefreshToken(): Promise<string | null> {
    const tokenDetails = await this.tokenRepository.getToken()
    if (!tokenDetails) return null

    const expiresAt = new Date(tokenDetails.expiresAt).getTime()
    const now = Date.now()

    // Refresh if expiring within 5 minutes (300,000 milliseconds)
    if (expiresAt - now < 5 * 60 * 1000) {
      try {
        const refreshed = await this.refreshAccessToken(tokenDetails.refreshToken)
        const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString()

        const updatedToken: TokenDetails = {
          accessToken: refreshed.access_token,
          refreshToken: refreshed.refresh_token || tokenDetails.refreshToken,
          expiresAt: newExpiresAt,
        }

        if (tokenDetails.id) {
          await this.tokenRepository.updateToken(tokenDetails.id, updatedToken)
        } else {
          // Fallback if ID is missing (purge and write)
          await this.tokenRepository.saveToken(
            updatedToken.accessToken,
            updatedToken.refreshToken,
            refreshed.expires_in,
          )
        }

        return refreshed.access_token
      } catch (err) {
        // Refresh failed: surface it so operators see "re-authenticate with Etsy"
        // rather than silently falling back to an unauthenticated request.
        etsyLogger.warn(
          `Etsy OAuth token refresh failed; subsequent requests will be unauthenticated until re-auth. ${
            err instanceof Error ? err.message : String(err)
          }`,
        )
        return null
      }
    }

    return tokenDetails.accessToken
  }

  /**
   * Main unified request handler. Decouples transport configurations and autocompletes headers.
   */
  async request<T>(endpoint: string, options: EtsyRequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options
    const url = new URL(`${ETSY_BASE_URL}${endpoint}`)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }

    const token = await this.getOrRefreshToken()

    const headers = new Headers()
    headers.set('Accept', 'application/json')
    // Etsy Open API v3 requires the keystring and shared secret joined by a colon on EVERY
    // request — `x-api-key: <keystring>:<shared_secret>`. Here the shared secret is part of
    // the mandated request credential (not a confidential OAuth client secret), so it must
    // be sent; omitting it makes the keystring invalid and Etsy rejects the request.
    // Ref: https://developer.etsy.com/documentation/essentials/authentication/
    headers.set('x-api-key', `${this.config.apiKey}:${this.config.sharedSecret}`)

    if (options.headers) {
      const inputHeaders = new Headers(options.headers)
      inputHeaders.forEach((value, key) => {
        headers.set(key, value)
      })
    }

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
      if (fetchOptions.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
      }
    }

    // Etsy enforces rate limits (HTTP 429). Retry a bounded number of times,
    // honoring the `Retry-After` header when present so we back off rather than
    // failing the whole sync on a transient throttle.
    const maxRetries = 3
    const REQUEST_TIMEOUT_MS = 15_000
    for (let attempt = 0; ; attempt++) {
      // Per-attempt timeout so a hung Etsy response can't stall the whole sync
      // (which runs serially) until the platform kills the function.
      // The timer must stay armed until the response body is fully read: Etsy can
      // return headers promptly and then stall mid-body, so clearing it right after
      // `fetch` resolves would leave `res.json()` unbounded.
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
      try {
        const res = await fetch(url.toString(), {
          ...fetchOptions,
          headers: Object.fromEntries(headers.entries()),
          signal: controller.signal,
        })

        if (res.status === 429 && attempt < maxRetries) {
          const retryAfter = Number(res.headers.get('retry-after'))
          const delayMs =
            Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 2 ** attempt * 1000
          etsyLogger.warn(
            `Etsy rate limit hit on ${endpoint} (attempt ${attempt + 1}/${maxRetries + 1}); retrying in ${delayMs}ms.`,
          )
          // Clear before backoff so the abort can't fire during the (possibly longer) sleep.
          clearTimeout(timeout)
          await new Promise((resolve) => setTimeout(resolve, delayMs))
          continue
        }

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          const msg = errorData.error || errorData.message || res.statusText
          throw new Error(`Etsy API Error (${res.status}): ${msg}`)
        }

        return await res.json()
      } catch (err) {
        if (controller.signal.aborted) {
          throw new Error(`Etsy request to ${endpoint} timed out after ${REQUEST_TIMEOUT_MS}ms`)
        }
        throw err
      } finally {
        clearTimeout(timeout)
      }
    }
  }

  // --- High leverage helpers for common resource requests ---

  /**
   * Retrieves active listings for a specific shop.
   */
  async getShopListings(shopId: number, limit = 100): Promise<{ results: unknown[] }> {
    return this.request<{ results: unknown[] }>(`/shops/${shopId}/listings/active`, {
      params: { limit },
    })
  }

  /**
   * Retrieves a single listing's details.
   */
  async getListing(listingId: number, includes?: string[]): Promise<unknown> {
    const params = includes ? { includes: includes.join(',') } : undefined
    return this.request(`/listings/${listingId}`, { params })
  }

  /**
   * Retrieves multiple listings in a batch request.
   */
  async getListingsBatch(
    listingIds: number[],
    includes?: string[],
  ): Promise<{ results: unknown[] }> {
    const params: Record<string, string> = {
      listing_ids: listingIds.join(','),
    }
    if (includes) {
      params.includes = includes.join(',')
    }
    return this.request<{ results: unknown[] }>('/listings/batch', { params })
  }
}
