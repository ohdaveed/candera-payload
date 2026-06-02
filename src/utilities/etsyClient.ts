import { getPayload, type Payload } from 'payload'
import configPromise from '@payload-config'

const ETSY_BASE_URL = 'https://openapi.etsy.com/v3/application'
const ETSY_OAUTH_URL = 'https://api.etsy.com/v3/public/oauth'
const SCOPES = ['listings_r', 'listings_w', 'shops_r', 'shops_w', 'transactions_r', 'transactions_w']

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

  constructor(
    config?: Partial<EtsyConfig>,
    tokenRepository?: TokenRepository
  ) {
    this.config = {
      apiKey: config?.apiKey || process.env.ETSY_API_KEY || '',
      sharedSecret: config?.sharedSecret || process.env.ETSY_SHARED_SECRET || '',
      redirectUri: config?.redirectUri || process.env.ETSY_REDIRECT_URI || '',
    }

    if (!this.config.apiKey || !this.config.sharedSecret) {
      throw new Error('Etsy API credentials missing. Please set ETSY_API_KEY and ETSY_SHARED_SECRET.')
    }

    this.tokenRepository = tokenRepository || new DefaultPayloadTokenRepository()
  }

  /**
   * Builds the authorization page URL for starting the Etsy OAuth 2.0 flow.
   */
  generateAuthUrl(): string {
    const url = new URL(`${ETSY_OAUTH_URL}/token`)
    url.searchParams.set('client_id', this.config.apiKey)
    url.searchParams.set('redirect_uri', this.config.redirectUri)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope', SCOPES.join(' '))
    // Basic unique identifier generation for state protection
    url.searchParams.set('state', crypto.randomUUID?.() || Math.random().toString(36).substring(2))

    return url.toString()
  }

  /**
   * Exchanges an authorization callback code for initial tokens and registers them.
   */
  async completeAuthFlow(code: string): Promise<void> {
    const basicAuth = Buffer.from(`${this.config.apiKey}:${this.config.sharedSecret}`).toString('base64')

    const res = await fetch(`${ETSY_OAUTH_URL}/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.config.apiKey,
        redirect_uri: this.config.redirectUri,
        code,
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
      tokenData.expires_in
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
    const basicAuth = Buffer.from(`${this.config.apiKey}:${this.config.sharedSecret}`).toString('base64')

    const res = await fetch(`${ETSY_OAUTH_URL}/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
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
            refreshed.expires_in
          )
        }

        return refreshed.access_token
      } catch {
        // Fall back to credential-based signature on refresh failure
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

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...options.headers,
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
      if (fetchOptions.body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json'
      }
    } else {
      // Fallback: use application API key and secret header signature
      headers['x-api-key'] = `${this.config.apiKey}:${this.config.sharedSecret}`
    }

    const res = await fetch(url.toString(), {
      ...fetchOptions,
      headers,
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      const msg = errorData.error || errorData.message || res.statusText
      throw new Error(`Etsy API Error (${res.status}): ${msg}`)
    }

    return res.json()
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
  async getListingsBatch(listingIds: number[], includes?: string[]): Promise<{ results: unknown[] }> {
    const params: Record<string, string> = {
      listing_ids: listingIds.join(','),
    }
    if (includes) {
      params.includes = includes.join(',')
    }
    return this.request<{ results: unknown[] }>('/listings/batch', { params })
  }
}
