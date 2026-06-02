const ETSY_BASE_URL = 'https://openapi.etsy.com/v3/application'

export type EtsyFetchOptions = RequestInit & {
  params?: Record<string, string | number | boolean>
}

/**
 * Core utility for making requests to the Etsy Open API v3.
 * Automatically handles authentication headers using ETSY_API_KEY and ETSY_SHARED_SECRET.
 */
export async function fetchEtsy(endpoint: string, options: EtsyFetchOptions = {}) {
  const apiKey = process.env.ETSY_API_KEY
  const sharedSecret = process.env.ETSY_SHARED_SECRET

  if (!apiKey || !sharedSecret) {
    throw new Error('Etsy API credentials missing. Please set ETSY_API_KEY and ETSY_SHARED_SECRET.')
  }

  const { params, ...fetchOptions } = options
  const url = new URL(`${ETSY_BASE_URL}${endpoint}`)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value))
    })
  }

  const res = await fetch(url.toString(), {
    ...fetchOptions,
    headers: {
      ...fetchOptions.headers,
      'x-api-key': `${apiKey}:${sharedSecret}`,
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    const msg = errorData.error || errorData.message || res.statusText
    throw new Error(`Etsy API Error (${res.status}): ${msg}`)
  }

  return res.json()
}

/**
 * Fetch a single listing's details from Etsy.
 */
export async function getEtsyListing(listingId: number, includes?: string[]) {
  const params = includes ? { includes: includes.join(',') } : undefined
  return fetchEtsy(`/listings/${listingId}`, { params })
}

/**
 * Fetch multiple listings by ID in a single call.
 */
export async function getEtsyListingsBatch(listingIds: number[], includes?: string[]) {
  const params: Record<string, string> = {
    listing_ids: listingIds.join(','),
  }
  if (includes) {
    params.includes = includes.join(',')
  }
  return fetchEtsy('/listings/batch', { params })
}

/**
 * Fetch all active listings for a specific shop.
 */
export async function getShopListings(shopId: number, limit = 100) {
  return fetchEtsy(`/shops/${shopId}/listings/active`, {
    params: { limit },
  })
}
