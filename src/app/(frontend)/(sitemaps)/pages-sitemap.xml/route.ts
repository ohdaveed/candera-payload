import 'server-only'
import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { cacheTag } from 'next/cache'
import { withPreviewSitemapFallback } from '@/utilities/previewSitemapFallback'

async function getPagesSitemap() {
  'use cache'
  cacheTag('pages-sitemap')

  const SITE_URL =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : '') ||
    'https://canderacandles.com'

  const dateFallback = new Date().toISOString()
  const fallback = [
    { loc: `${SITE_URL}/search`, lastmod: dateFallback },
    { loc: `${SITE_URL}/posts`, lastmod: dateFallback },
  ]

  return withPreviewSitemapFallback(async () => {
    const payload = await getPayload({ config })

    const results = await payload.find({
      collection: 'pages',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: {
        _status: {
          equals: 'published',
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    const sitemap = results.docs
      ? results.docs
          .filter((page) => Boolean(page?.slug))
          .map((page) => {
            return {
              loc: page?.slug === 'home' ? `${SITE_URL}/` : `${SITE_URL}/${page?.slug}`,
              lastmod: page.updatedAt || dateFallback,
            }
          })
      : []

    return [...fallback, ...sitemap]
  }, fallback)
}

export async function GET() {
  const sitemap = await getPagesSitemap()

  return getServerSideSitemap(sitemap)
}
