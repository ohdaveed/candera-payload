import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import { homeStatic } from '@/endpoints/seed/home-static'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import { getServerSideURL } from '@/utilities/getURL'
import { ETSY_SHOP_URL } from '@/lib/etsy'
import { SetHeaderTheme } from '@/components/SetHeaderTheme'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { BRAND } from '@/constants/brand'

export async function generateStaticParams() {
  return []
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/' + decodedSlug
  let page: RequiredDataFromCollectionSlug<'pages'> | null

  page = await queryPageBySlug({
    slug: decodedSlug,
  })

  // Remove this code once your website is seeded
  if (!page && slug === 'home') {
    page = homeStatic
  }

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page

  const isHome = decodedSlug === 'home'
  const serverUrl = getServerSideURL()
  const siteSchema = isHome
    ? [
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Candera',
          url: serverUrl,
          logo: `${serverUrl}/favicon.svg`,
          description:
            'Hand-poured botanical candles, artisan-crafted in California for intentional living.',
          sameAs: [ETSY_SHOP_URL, BRAND.instagramUrl],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Candera',
          url: serverUrl,
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${serverUrl}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        },
      ]
    : null

  return (
    <div className="pb-32 bg-candera-vellum">
      {siteSchema?.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <SetHeaderTheme theme="light" />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <RenderHero {...hero} />

      <div id="main-content">
        <span
          className="block h-px max-w-[1280px] mx-auto bg-candera-stone/20"
          aria-hidden="true"
        />
        <RenderBlocks blocks={layout} />
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = 'home' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const page = await queryPageBySlug({
    slug: decodedSlug,
  })

  const meta = await generateMeta({ doc: page })

  if (page?.title && page.slug !== 'home') {
    meta.title = `${page.title} — Candera`
  }

  return meta
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
