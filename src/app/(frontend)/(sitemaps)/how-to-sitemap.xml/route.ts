import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

const getHowToSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : '') ||
      'https://canderacandles.com'

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

    const dateFallback = new Date().toISOString()

    const sitemap = results.docs
      ? results.docs
          .filter((guide) => Boolean(guide?.slug))
          .map((guide) => ({
            loc: `${SITE_URL}/how-to/${guide?.slug}`,
            lastmod: guide.updatedAt || dateFallback,
          }))
      : []

    return sitemap
  },
  ['how-tos-sitemap'],
  {
    tags: ['how-tos-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getHowToSitemap()

  return getServerSideSitemap(sitemap)
}
