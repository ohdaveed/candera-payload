import { type Payload } from 'payload'
import { EtsyClient, DefaultPayloadTokenRepository } from './etsyClient'
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
async function syncListingImage(
  listingId: number,
  payload: Payload,
  client: EtsyClient,
  existingImages?: any[]
) {
  try {
    let images = existingImages

    if (!images) {
      const imageData = await client.request<{ results: any[] }>(`/listings/${listingId}/images`)
      images = imageData.results || []
    }

    if (!images || images.length === 0) return null

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

export async function syncEtsyListings(
  source: number | number[],
  payload: Payload
) {
  const isBatch = Array.isArray(source)
  payload.logger.info(isBatch 
    ? `Starting Etsy sync for ${source.length} listing IDs...` 
    : `Starting Etsy sync for shop ${source}...`
  )

  const tokenRepository = new DefaultPayloadTokenRepository(payload)
  const client = new EtsyClient(undefined, tokenRepository)

  try {
    let listings: any[] = []

    if (isBatch) {
      // 1a. Fetch specific listings in batch
      try {
        const data = await client.getListingsBatch(source, ['Images'])
        listings = data.results || []
      } catch (err: any) {
        payload.logger.warn(`Batch fetch failed, attempting individual fetches: ${err.message}`)
        // Fallback: try each ID individually
        for (const id of source) {
          try {
            const data = await client.request<{ results: any[] }>(`/listings/${id}`, { params: { includes: 'Images' } })
            if (data) listings.push(data)
          } catch (individualErr: any) {
            payload.logger.error(`Failed to fetch individual listing ${id}: ${individualErr.message}`)
          }
        }
      }
    } else {
      // 1b. Fetch active listings from shop
      const data = await client.getShopListings(source, 100)
      listings = data.results || []
    }

    payload.logger.info(`Found ${listings.length} listings on Etsy.`)

    if (listings.length === 0) {
      payload.logger.warn('No listings found for the provided source in Etsy API.')
      return { success: true, count: 0 }
    }

    let syncedCount = 0

    // 2. Loop through and upsert into Payload
    for (const listing of listings) {
      const { listing_id, title, description, images } = listing

      // Simple slug generation
      const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')

      const slug = `${baseSlug}-${listing_id}`

      // Fetch and sync the main image (pass existing images if we have them from batch)
      const mainImageId = await syncListingImage(listing_id, payload, client, images)

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
