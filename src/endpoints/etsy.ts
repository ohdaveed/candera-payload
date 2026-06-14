import type { Endpoint } from 'payload'

import { DefaultPayloadTokenRepository, EtsyClient } from '@/utilities/etsyClient'
import { syncEtsyListings } from '@/utilities/syncEtsy'

const getEtsyShopId = () => Number(process.env.ETSY_SHOP_ID) || 25894791

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
  handler: async (req) => Response.redirect(createEtsyClient(req).generateAuthUrl()),
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
      return Response.json({ error: String(error) }, { status: 500 })
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

    try {
      await createEtsyClient(req).completeAuthFlow(code)
      return Response.redirect(
        `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/admin`,
      )
    } catch (error) {
      return Response.json({ error: String(error) }, { status: 500 })
    }
  },
}

export const etsyEndpoints: Endpoint[] = [
  syncEtsyEndpoint,
  etsyOAuthInitEndpoint,
  setEtsyVacationEndpoint,
  etsyOAuthCallbackEndpoint,
]
