import type { Media, Product } from '@/payload-types'

/**
 * Resolves a product's primary display image.
 *
 * Prefers the sync-owned `etsyPrimaryImage` (rewritten on every Etsy sync, so it
 * tracks the live listing's main photo) and falls back to the first editor
 * gallery photo — both for products synced before `etsyPrimaryImage` existed and
 * for products curated entirely by hand. Centralised so every surface (PDP,
 * cards, gallery, quick view) agrees on which image is "primary".
 */
export const productPrimaryPhoto = (
  etsyPrimaryImage?: Product['etsyPrimaryImage'],
  extraPhotos?: Product['extraPhotos'],
): Media | number | null => {
  if (etsyPrimaryImage) return etsyPrimaryImage
  return extraPhotos?.[0] ?? null
}

/**
 * Ordered, de-duplicated image list for a product gallery: the primary image
 * first, then the editor gallery (skipping the primary if it also appears there,
 * which happens for legacy products whose primary lived in `extraPhotos[0]`).
 */
export const productGalleryPhotos = (
  etsyPrimaryImage?: Product['etsyPrimaryImage'],
  extraPhotos?: Product['extraPhotos'],
): (Media | number)[] => {
  const primary = productPrimaryPhoto(etsyPrimaryImage, extraPhotos)
  const gallery = extraPhotos ?? []
  const idOf = (img: Media | number): number | null =>
    typeof img === 'object' ? img.id : typeof img === 'number' ? img : null

  if (!primary) return [...gallery]
  const primaryId = idOf(primary)
  const rest = gallery.filter((img) => primaryId === null || idOf(img) !== primaryId)
  return [primary, ...rest]
}
