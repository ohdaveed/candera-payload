import { getPayload } from 'payload'
import config from '@payload-config'
import { getServerSideURL } from './getURL'

const ETSY_BASE_URL = 'https://openapi.etsy.com/v3/application'
const ETSY_OAUTH_URL = 'https://api.etsy.com/v3/public/oauth'

const SCOPES = ['listings_r', 'listings_w', 'shops_r', 'shops_w', 'transactions_r', 'transactions_w']

/**
 * Build the Etsy OAuth authorization URL.
 */
export function getAuthorizationUrl(): string {
  const apiKey = process.env.ETSY_API_KEY
  if (!apiKey) throw new Error('ETSY_API_KEY is not set')

  const redirectUri = `${getServerSideURL()}/api/etsy/oauth/callback`
  const url = new URL(`${ETSY_OAUTH_URL}/token`)
  url.searchParams.set('client_id', apiKey)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', SCOPES.join(' '))
  url.searchParams.set('state', crypto.randomUUID())

  return url.toString()
}

/**
 * Exchange an authorization code for an access token.
 */
export async function exchangeCode(code: string): Promise<{
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}> {
  const apiKey = process.env.ETSY_API_KEY
  const sharedSecret = process.env.ETSY_SHARED_SECRET
  if (!apiKey || !sharedSecret) {
    throw new Error('Etsy API credentials missing')
  }

  const redirectUri = `${getServerSideURL()}/api/etsy/oauth/callback`
  const basicAuth = Buffer.from(`${apiKey}:${sharedSecret}`).toString('base64')

  const res = await fetch(`${ETSY_OAUTH_URL}/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: apiKey,
      redirect_uri: redirectUri,
      code,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Etsy OAuth token exchange failed (${res.status}): ${body}`)
  }

  return res.json()
}

/**
 * Refresh an expiring access token using a refresh token.
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}> {
  const apiKey = process.env.ETSY_API_KEY
  const sharedSecret = process.env.ETSY_SHARED_SECRET
  if (!apiKey || !sharedSecret) {
    throw new Error('Etsy API credentials missing')
  }

  const basicAuth = Buffer.from(`${apiKey}:${sharedSecret}`).toString('base64')

  const res = await fetch(`${ETSY_OAUTH_URL}/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: apiKey,
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
 * Retrieve a valid access token from the database, refreshing if necessary.
 */
export async function getValidAccessToken(): Promise<string | null> {
  try {
    const payload = await getPayload({ config })
    const tokens = await payload.find({
      collection: 'etsy-tokens',
      limit: 1,
      sort: '-updatedAt',
    })

    if (!tokens.docs.length) return null

    const token = tokens.docs[0]
    const expiresAt = new Date(token.expiresAt).getTime()
    const now = Date.now()

    // If token expires within 5 minutes, refresh it
    if (expiresAt - now < 5 * 60 * 1000) {
      const refreshed = await refreshAccessToken(token.refreshToken)
      const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString()

      await payload.update({
        collection: 'etsy-tokens',
        id: token.id,
        data: {
          accessToken: refreshed.access_token,
          refreshToken: refreshed.refresh_token || token.refreshToken,
          expiresAt: newExpiresAt,
        },
      })

      return refreshed.access_token
    }

    return token.accessToken
  } catch {
    return null
  }
}

/**
 * Store OAuth tokens in the database (replaces any existing tokens).
 */
export async function storeTokens(accessToken: string, refreshToken: string, expiresIn: number) {
  const payload = await getPayload({ config })

  // Remove old tokens
  const existing = await payload.find({
    collection: 'etsy-tokens',
    limit: 100,
  })
  for (const doc of existing.docs) {
    await payload.delete({ collection: 'etsy-tokens', id: doc.id })
  }

  // Save new token
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

/**
 * Make an authenticated Etsy API request using OAuth token.
 * Falls back to API key if no OAuth token is available.
 */
export async function fetchEtsyWithAuth(
  endpoint: string,
  options: RequestInit & { params?: Record<string, string | number | boolean> } = {},
) {
  const token = await getValidAccessToken()
  const { params, ...fetchOptions } = options
  const url = new URL(`${ETSY_BASE_URL}${endpoint}`)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value))
    })
  }

  if (token) {
    const res = await fetch(url.toString(), {
      ...fetchOptions,
      headers: {
        ...fetchOptions.headers,
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': fetchOptions.body ? 'application/json' : 'application/x-www-form-urlencoded',
      },
    })
    return res
  }

  // Fall back to API key
  const apiKey = process.env.ETSY_API_KEY
  const sharedSecret = process.env.ETSY_SHARED_SECRET
  const res = await fetch(url.toString(), {
    ...fetchOptions,
    headers: {
      ...fetchOptions.headers,
      'x-api-key': `${apiKey}:${sharedSecret}`,
      Accept: 'application/json',
    },
  })
  return res
}
