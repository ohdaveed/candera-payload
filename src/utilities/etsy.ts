const ETSY_BASE_URL = 'https://openapi.etsy.com/v3/application'

export async function fetchEtsy(endpoint: string, options: RequestInit = {}) {
  const apiKey = process.env.ETSY_API_KEY
  const sharedSecret = process.env.ETSY_SHARED_SECRET
  const url = `${ETSY_BASE_URL}${endpoint}`
  
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'x-api-key': `${apiKey}:${sharedSecret}`,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(`Etsy API Error: ${error.message || res.statusText}`)
  }

  return res.json()
}

/**
 * Fetch a single listing's details from Etsy
 */
export async function getEtsyListing(listingId: number) {
  return fetchEtsy(`/listings/${listingId}`)
}

/**
 * Fetch all active listings for a specific shop
 */
export async function getShopListings(shopId: number) {
  return fetchEtsy(`/shops/${shopId}/listings/active`)
}
