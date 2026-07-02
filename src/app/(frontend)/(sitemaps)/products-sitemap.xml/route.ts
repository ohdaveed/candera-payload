import 'server-only'
import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { cacheTag } from 'next/cache'
import { withPreviewSitemapFallback } from '@/utilities/previewSitemapFallback'

async function getProductsSitemap() {
  'use cache'
  cacheTag('products-sitemap')

  const SITE_URL =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : '') ||
    'https://canderacandles.com'

  const dateFallback = new Date().toISOString()
  const fallback = [{ loc: `${SITE_URL}/products`, lastmod: dateFallback }]

  return withPreviewSitemapFallback(async () => {
    const payload = await getPayload({ config })

    const results = await payload.find({
      collection: 'products',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    const sitemap = results.docs
      ? results.docs
          .filter((product) => Boolean(product?.slug))
          .map((product) => {
            return {
              loc: `${SITE_URL}/products/${product?.slug}`,
              lastmod: product.updatedAt || dateFallback,
            }
          })
      : []

    return [...fallback, ...sitemap]
  }, fallback)
}

export async function GET() {
  const sitemap = await getProductsSitemap()

  return getServerSideSitemap(sitemap)
}
