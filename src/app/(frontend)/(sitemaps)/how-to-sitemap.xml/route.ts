import 'server-only'
import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { cacheTag } from 'next/cache'
import { withPreviewSitemapFallback } from '@/utilities/previewSitemapFallback'

async function getHowToSitemap() {
  'use cache'
  cacheTag('how-tos-sitemap')

  const SITE_URL =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : '') ||
    'https://canderacandles.com'

  const dateFallback = new Date().toISOString()
  const fallback = [{ loc: `${SITE_URL}/how-to`, lastmod: dateFallback }]

  return withPreviewSitemapFallback(async () => {
    const payload = await getPayload({ config })

    const results = await payload.find({
      collection: 'how-to-guides',
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

    const detailPages = results.docs
      ? results.docs
          .filter((guide) => Boolean(guide?.slug))
          .map((guide) => ({
            loc: `${SITE_URL}/how-to/${guide?.slug}`,
            lastmod: guide.updatedAt || dateFallback,
          }))
      : []

    return [...fallback, ...detailPages]
  }, fallback)
}

export async function GET() {
  const sitemap = await getHowToSitemap()

  return getServerSideSitemap(sitemap)
}
