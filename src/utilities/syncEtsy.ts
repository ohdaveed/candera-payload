import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import { fetchEtsy } from './etsy'

export async function syncEtsyListings(shopId: number, payload: Payload) {
  payload.logger.info(`Starting Etsy sync for shop ${shopId}...`)

  try {
    // 1. Fetch active listings from Etsy
    const data = await fetchEtsy(`/shops/${shopId}/listings/active`)
    const listings = data.results || []

    payload.logger.info(`Found ${listings.length} listings on Etsy.`)

    if (listings.length === 0) {
      payload.logger.warn('No active listings found for this shop in Etsy API.')
      return { success: true, count: 0 }
    }

    let syncedCount = 0

    // 2. Loop through and upsert into Payload
    for (const listing of listings) {
      const { listing_id, title, url } = listing
      
      // Simple slug generation
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')

      // Check if product already exists
      const existing = await payload.find({
        collection: 'products',
        where: {
          etsyListingId: {
            equals: listing_id,
          },
        },
      })

      if (existing.docs.length > 0) {
        // Update
        await payload.update({
          collection: 'products',
          id: existing.docs[0].id,
          data: {
            title,
            slug,
          },
        })
        payload.logger.info(`Updated product: ${title} (ID: ${listing_id})`)
      } else {
        // Create
        await payload.create({
          collection: 'products',
          data: {
            title,
            etsyListingId: listing_id,
            slug,
          },
        })
        payload.logger.info(`Created product: ${title} (ID: ${listing_id})`)
      }
      syncedCount++
    }

    return { success: true, count: syncedCount }
  } catch (error) {
    payload.logger.error('Error syncing Etsy listings:', error)
    throw error
  }
}
