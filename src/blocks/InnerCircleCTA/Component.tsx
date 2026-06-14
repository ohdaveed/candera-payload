import React from 'react'
import { cache } from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Media } from '@/components/Media'
import { Eyebrow } from '@/components/ui/eyebrow'
import { InnerCircleEmailForm } from './EmailForm'
import type { InnerCircleCTABlock as InnerCircleCTABlockType } from '@/payload-types'

type Props = InnerCircleCTABlockType & { disableInnerContainer?: boolean }

const getInnerCircleFormId = cache(async () => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'forms',
    where: { title: { equals: 'Inner Circle Signup' } },
    limit: 1,
    depth: 0,
  })
  return result.docs[0]?.id?.toString() ?? ''
})

export async function InnerCircleCTABlock({ headline, description, media }: Props) {
  const formId = await getInnerCircleFormId()

  return (
    <section className="flex flex-col md:flex-row min-h-[580px] border-t border-candera-stone/20">
      {/* Left: editorial photo */}
      {media && typeof media === 'object' && (
        <div className="relative w-full md:w-1/2 min-h-[360px] md:min-h-full overflow-hidden bg-candera-ash">
          <Media
            fill
            imgClassName="object-cover transition-transform duration-[3s] hover:scale-105"
            resource={media}
          />
          {/* Subtle dark vignette for edge definition */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to right, transparent 60%, rgba(245,242,237,0.15) 100%)',
            }}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Right: content */}
      <div className="w-full md:w-1/2 flex flex-col justify-center gap-10 px-10 md:px-20 lg:px-24 py-16 bg-candera-vellum grain">
        {/* Eyebrow with inline rule */}
        <div className="flex items-center gap-4">
          <span className="w-8 h-[1px] bg-candera-ember-strong" aria-hidden="true" />
          <Eyebrow className="text-candera-sage-text">The Inner Circle</Eyebrow>
        </div>

        {/* Headline */}
        <h2
          className="font-display italic text-candera-obsidian leading-[1.1] m-0"
          style={{ fontSize: 'clamp(1.75rem, 3vw, 2.75rem)' }}
        >
          {headline}
        </h2>

        {/* Description */}
        {description && (
          <p className="font-serif italic text-[16px] leading-[1.8] text-candera-sage-text max-w-[38ch] m-0">
            {description}
          </p>
        )}

        {/* Email form */}
        <InnerCircleEmailForm formId={formId} />

        {/* Trust note */}
        <p className="text-[10px] uppercase tracking-[.2em] text-candera-sage-text m-0">
          No noise. First access to new batches. Unsubscribe anytime.
        </p>
      </div>
    </section>
  )
}
