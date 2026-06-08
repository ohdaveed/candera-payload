import type { Metadata } from 'next'
import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Eyebrow } from '@/components/ui/eyebrow'
import { InnerCircleEmailForm } from '@/blocks/InnerCircleCTA/EmailForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'The Inner Circle — Candera',
  description:
    'Join the Inner Circle for early access to every new batch before the public announcement.',
}

export default async function InnerCirclePage() {
  const payload = await getPayload({ config: configPromise })

  const formsResult = await payload.find({
    collection: 'forms',
    where: { title: { equals: 'Inner Circle Signup' } },
    limit: 1,
    depth: 0,
  })

  const formId = formsResult.docs[0]?.id?.toString() ?? ''

  return (
    <div className="min-h-screen bg-candera-linen pt-32 pb-32">
      <div className="container">
        <div className="max-w-[600px] mx-auto text-center">
          <Eyebrow className="block mb-6">The Inner Circle</Eyebrow>

          <h1 className="hero-heading text-candera-obsidian mb-8">First access. Every batch.</h1>

          <p className="editorial text-[18px] leading-[1.9] text-candera-sage-text mb-14 max-w-[480px] mx-auto">
            Our batches often sell out within 48 hours. Join to receive 24-hour early access to
            every limited drop — before the public announcement. No noise, just scent.
          </p>

          <div className="flex flex-col items-center gap-4">
            <InnerCircleEmailForm formId={formId} />
            <p className="font-sans text-[11px] text-candera-stone/60 mt-2">
              No spam. Unsubscribe anytime.
            </p>
          </div>

          <div className="mt-24 pt-16 border-t border-candera-stone/20">
            <h2 className="font-display text-2xl text-candera-obsidian mb-10 italic">
              What you&apos;ll receive
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
              <div>
                <p className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-candera-ember mb-3">
                  Early Access
                </p>
                <p className="editorial text-[15px] text-candera-sage-text leading-relaxed">
                  24-hour advance notice before every new batch goes public.
                </p>
              </div>
              <div>
                <p className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-candera-ember mb-3">
                  Ritual Invitations
                </p>
                <p className="editorial text-[15px] text-candera-sage-text leading-relaxed">
                  Seasonal studio events and workshops, extended to members only.
                </p>
              </div>
              <div>
                <p className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-candera-ember mb-3">
                  Studio Notes
                </p>
                <p className="editorial text-[15px] text-candera-sage-text leading-relaxed">
                  Behind-the-scenes updates from the curing room and new scent development.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
