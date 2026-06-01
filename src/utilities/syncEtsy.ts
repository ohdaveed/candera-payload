import { type Payload } from 'payload'
import { fetchEtsy } from './etsy'
import type { Product } from '@/payload-types'

/**
 * Converts plain text to a basic Lexical rich text structure.
 */
function textToRichText(text: string): Product['description'] {
  if (!text) return null
  return {
    root: {
      type: 'root',
      format: 'left',
      indent: 0,
      version: 1,
      children: text.split('\n').map((line) => ({
        type: 'paragraph',
        format: 'left',
        indent: 0,
        version: 1,
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: line,
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
      })),
      direction: 'ltr',
    },
  }
}

/**
 * Fetches the main image for an Etsy listing and syncs it to the Media collection.
 * Idempotent: won't re-download if the image already exists.
 */
async function syncListingImage(listingId: number, payload: Payload) {
  try {
    const imageData = await fetchEtsy(`/listings/${listingId}/images`)
    const images = imageData.results || []
    if (images.length === 0) return null

    // Get the first image (rank 1)
    const mainImage = images[0]
    const etsyImageId = mainImage.listing_image_id

    // Check if this image already exists in our media collection
    const existingMedia = await payload.find({
      collection: 'media',
      where: {
        etsyImageId: {
          equals: etsyImageId,
        },
      },
    })

    if (existingMedia.docs.length > 0) {
      return existingMedia.docs[0].id
    }

    // Download the image
    const imageUrl = mainImage.url_fullxfull
    payload.logger.info(`Downloading image from Etsy: ${imageUrl}`)
    const response = await fetch(imageUrl)
    if (!response.ok) throw new Error(`Failed to download image: ${response.statusText}`)

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create a new media document
    const media = await payload.create({
      collection: 'media',
      data: {
        etsyImageId,
        alt: mainImage.alt_text || '',
      },
      file: {
        data: buffer,
        name: `etsy-${listingId}-${etsyImageId}.jpg`,
        mimetype: 'image/jpeg',
        size: buffer.length,
      },
    })

    return media.id
  } catch (error) {
    payload.logger.error({ err: error, msg: `Error syncing image for Etsy listing ${listingId}` })
    return null
  }
}

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
      const { listing_id, title, description } = listing

      // Simple slug generation
      const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')

      const slug = `${baseSlug}-${listing_id}`

      // Fetch and sync the main image
      const mainImageId = await syncListingImage(listing_id, payload)

      const productData: Partial<Product> = {
        title,
        slug,
        description: textToRichText(description),
      }

      if (mainImageId) {
        productData.extraPhotos = [mainImageId]
      }

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
          data: productData as unknown as Product,
        })
        payload.logger.info(`Updated product: ${title} (ID: ${listing_id})`)
      } else {
        // Create
        await payload.create({
          collection: 'products',
          data: {
            ...productData,
            etsyListingId: listing_id,
          } as unknown as Product,
        })
        payload.logger.info(`Created product: ${title} (ID: ${listing_id})`)
      }
      syncedCount++
    }

    return { success: true, count: syncedCount }
  } catch (error) {
    payload.logger.error({ err: error, msg: 'Error syncing Etsy listings' })
    throw error
  }
}
