import type { Product } from '@/payload-types'
import type { CardPostData } from '@/components/Card'

/** Maps a full Product doc to the slim card shape the product grids render. */
export function toGridProduct(product: Product): CardPostData {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    tagline: product.tagline,
    extraPhotos: product.extraPhotos,
    etsyPrimaryImage: product.etsyPrimaryImage,
    scentProfile: product.scentProfile,
    price: product.price,
    currency: product.currency,
    categories: product.categories?.map((cat) =>
      typeof cat === 'object' && cat !== null ? { title: cat.title } : cat,
    ),
  }
}
