import type { Metadata } from 'next'

import Link from 'next/link'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import type { Product } from '@/payload-types'

import { Media } from '@/components/Media'
import { FragranceProfile } from '@/components/FragranceProfile'
import { generateMeta } from '@/utilities/generateMeta'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const products = await payload.find({
    collection: 'products',
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })
  return products.docs.map(({ slug }) => ({ slug }))
}

type Args = { params: Promise<{ slug?: string }> }

export default async function ProductPage({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/products/' + decodedSlug
  const product = await queryProductBySlug({ slug: decodedSlug })

  if (!product) return <PayloadRedirects url={url} />

  const heroImage =
    product.extraPhotos && product.extraPhotos.length > 0
      ? product.extraPhotos[0]
      : null

  return (
    <article className="pt-16 pb-24 bg-candera-linen min-h-screen">
      <PayloadRedirects disableNotFound url={url} />

      <div className="max-w-[1280px] mx-auto px-6 md:px-10">
        {/* Back link */}
        <Link
          href="/#collection"
          className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.2em] text-candera-sage hover:text-candera-ember transition-colors mt-8 mb-12"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to Collection
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          {/* Left: image */}
          <div className="relative aspect-square overflow-hidden bg-candera-ash">
            {heroImage && typeof heroImage !== 'string' ? (
              <Media fill imgClassName="object-cover" resource={heroImage} priority />
            ) : (
              <div className="flex h-full items-center justify-center text-candera-sage text-sm">
                Image unavailable
              </div>
            )}
            {product.productTag && (
              <div className="absolute top-4 left-4">
                <span
                  className={[
                    'text-[9px] font-bold uppercase tracking-[.18em] px-2.5 py-1.5',
                    product.productTag === 'Limited Batch' && 'bg-candera-ember-strong text-white',
                    product.productTag === 'Bestseller' && 'bg-candera-obsidian text-white',
                    product.productTag === 'New Release' && 'bg-candera-rose text-white',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {product.productTag}
                </span>
              </div>
            )}
          </div>

          {/* Right: details */}
          <div className="flex flex-col gap-6 py-4">
            {product.vessel && (
              <span className="text-[10px] font-bold uppercase tracking-[.3em] text-candera-sage">
                Vessel {product.vessel}
              </span>
            )}

            <h1
              className="font-display font-thin italic text-candera-obsidian leading-[1.08] m-0"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
            >
              {product.title}
            </h1>

            {product.tagline && (
              <p className="font-editorial italic text-[18px] leading-[1.7] text-candera-sage-text">
                {product.tagline}
              </p>
            )}

            {product.price != null && (
              <p className="text-[22px] font-semibold text-candera-obsidian">
                ${Number(product.price).toFixed(2)}
              </p>
            )}

            <FragranceProfile
              profile={product.scentProfile}
              burnTime={product.burnTime}
              atmosphere={product.atmosphere}
            />

            {product.etsyListingId && (
              <a
                href={`https://www.etsy.com/listing/${product.etsyListingId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-[46px] px-8 text-[11px] font-bold uppercase tracking-[.2em] bg-candera-obsidian text-white hover:bg-candera-ember transition-colors mt-2"
                style={{ borderRadius: 0 }}
              >
                Add to the Ritual
              </a>
            )}

            {/* Product details list */}
            {product.scentProfile && (
              <div className="border-t border-candera-stone/40 pt-6 mt-2">
                <p className="text-[9px] font-bold uppercase tracking-[.3em] text-candera-sage mb-3">
                  Details
                </p>
                <ul className="flex flex-col gap-1.5">
                  {['15 oz · Soy & beeswax blend', 'Numbered vessel', 'Micro-batch cured', 'Ships from California'].map((detail) => (
                    <li key={detail} className="text-[13px] text-candera-sage-text flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-candera-stone inline-block shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const product = await queryProductBySlug({ slug: decodeURIComponent(slug) })
  return generateMeta({ doc: product as any })
}

const queryProductBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'products',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: { slug: { equals: slug } },
  })

  return result.docs?.[0] || null
})
