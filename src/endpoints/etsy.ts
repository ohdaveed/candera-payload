import type { Endpoint } from 'payload'

import { DefaultPayloadTokenRepository, EtsyClient } from '@/utilities/etsyClient'
import { syncEtsyListings } from '@/utilities/syncEtsy'
import { deriveCodeChallenge, generateCodeVerifier } from '@/utilities/pkce'

const getEtsyShopId = (): number => {
  const shopId = Number(process.env.ETSY_SHOP_ID)
  if (!Number.isInteger(shopId) || shopId <= 0) {
    throw new Error(
      'ETSY_SHOP_ID is not set to a valid numeric shop id. Refusing to sync against an unknown shop.',
    )
  }
  return shopId
}

const getEtsyRedirectUri = (req: Parameters<Endpoint['handler']>[0]) => {
  let requestOrigin: string | undefined

  if (req.url) {
    try {
      requestOrigin = new URL(req.url).origin
    } catch {
      requestOrigin = undefined
    }
  }

  const forwardedHost = req.headers.get('x-forwarded-host')
  const forwardedProto = req.headers.get('x-forwarded-proto') || 'https'
  const origin =
    requestOrigin ||
    (forwardedHost ? `${forwardedProto}://${forwardedHost}` : undefined) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    'http://localhost:3000'

  return `${origin}/api/etsy/oauth/callback`
}

const createEtsyClient = (req: Parameters<Endpoint['handler']>[0]) =>
  new EtsyClient(
    { redirectUri: getEtsyRedirectUri(req) },
    new DefaultPayloadTokenRepository(req.payload),
  )

const OAUTH_STATE_COOKIE = 'etsy_oauth_state'
const OAUTH_VERIFIER_COOKIE = 'etsy_oauth_verifier'

// Lax so the cookies ride the top-level GET redirect back from Etsy; Secure is
// honored on https (and on localhost, which browsers treat as a secure context).
const buildOAuthCookie = (name: string, value: string, maxAgeSeconds: number) =>
  `${name}=${value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}`

const readCookie = (cookieHeader: string | null, name: string): string | undefined => {
  if (!cookieHeader) return undefined
  for (const part of cookieHeader.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return rest.join('=')
  }
  return undefined
}

export const syncEtsyEndpoint: Endpoint = {
  path: '/sync-etsy',
  method: 'get',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const result = await syncEtsyListings(getEtsyShopId(), req.payload)
      return Response.json(result)
    } catch (error) {
      req.payload.logger.error({ err: error, msg: 'Error in /sync-etsy endpoint' })
      return Response.json({ error: 'Error syncing Etsy listings' }, { status: 500 })
    }
  },
}

export const etsyOAuthInitEndpoint: Endpoint = {
  path: '/etsy/oauth/init',
  method: 'get',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const state = crypto.randomUUID()
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = deriveCodeChallenge(codeVerifier)
    const authUrl = createEtsyClient(req).generateAuthUrl(state, codeChallenge)
    const headers = new Headers({ Location: authUrl })
    headers.append('Set-Cookie', buildOAuthCookie(OAUTH_STATE_COOKIE, state, 600))
    headers.append('Set-Cookie', buildOAuthCookie(OAUTH_VERIFIER_COOKIE, codeVerifier, 600))
    return new Response(null, { status: 302, headers })
  },
}

export const setEtsyVacationEndpoint: Endpoint = {
  path: '/etsy/set-vacation',
  method: 'get',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const data = await createEtsyClient(req).request<unknown>(`/shops/${getEtsyShopId()}`, {
        method: 'PUT',
        body: JSON.stringify({ is_vacation: false }),
      })
      return Response.json({ success: true, shop: data })
    } catch (error) {
      req.payload.logger.error({ err: error, msg: 'Error in /etsy/set-vacation endpoint' })
      return Response.json({ error: 'Error setting vacation mode' }, { status: 500 })
    }
  },
}

export const etsyOAuthCallbackEndpoint: Endpoint = {
  path: '/etsy/oauth/callback',
  method: 'get',
  handler: async (req) => {
    if (!req.url) {
      return Response.json({ error: 'Missing request URL' }, { status: 400 })
    }

    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    if (!code) {
      return Response.json({ error: 'Missing authorization code' }, { status: 400 })
    }

    // CSRF defense: the state echoed back by Etsy must match the value set on the
    // init redirect and stored in an HttpOnly cookie.
    const cookieHeader = req.headers.get('cookie')
    const state = url.searchParams.get('state')
    const expectedState = readCookie(cookieHeader, OAUTH_STATE_COOKIE)
    if (!state || !expectedState || state !== expectedState) {
      return Response.json({ error: 'Invalid OAuth state' }, { status: 400 })
    }

    // PKCE: the verifier minted at init (stored in an HttpOnly cookie) is required
    // to complete the token exchange.
    const codeVerifier = readCookie(cookieHeader, OAUTH_VERIFIER_COOKIE)
    if (!codeVerifier) {
      return Response.json({ error: 'Missing PKCE verifier' }, { status: 400 })
    }

    try {
      await createEtsyClient(req).completeAuthFlow(code, codeVerifier)
      const headers = new Headers({ Location: new URL('/admin', url.origin).toString() })
      headers.append('Set-Cookie', buildOAuthCookie(OAUTH_STATE_COOKIE, '', 0))
      headers.append('Set-Cookie', buildOAuthCookie(OAUTH_VERIFIER_COOKIE, '', 0))
      return new Response(null, { status: 302, headers })
    } catch (error) {
      req.payload.logger.error({ err: error, msg: 'Error in /etsy/oauth/callback endpoint' })
      return Response.json({ error: 'Error completing Etsy authorization' }, { status: 500 })
    }
  },
}

export const etsyEndpoints: Endpoint[] = [
  syncEtsyEndpoint,
  etsyOAuthInitEndpoint,
  setEtsyVacationEndpoint,
  etsyOAuthCallbackEndpoint,
]
