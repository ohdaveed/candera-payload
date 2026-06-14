import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { InnerCircleEmailForm } from '@/blocks/InnerCircleCTA/EmailForm'
import { PageHeader } from '@/components/PageHeader'

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
    <div className="min-h-screen bg-candera-linen pt-32 pb-32" data-page="inner-circle">
      <div className="container">
        <div className="max-w-[600px] mx-auto text-center">
          <PageHeader
            align="center"
            eyebrow="The Inner Circle"
            title="Be the first to know."
            description="Our studio doors are opening. Join the Inner Circle to receive advance notice of new arrivals, behind-the-scenes updates from the studio, and seasonal ritual invitations."
            maxWidthClassName="max-w-[600px]"
            descriptionClassName="text-[18px] leading-[1.9] max-w-[480px] mx-auto"
            className="mb-14"
          />

          <div className="flex flex-col items-center gap-4">
            <InnerCircleEmailForm formId={formId} />
            <p className="font-sans text-[11px] text-candera-stone/60 mt-2">
              No spam. Unsubscribe anytime.
            </p>
          </div>

          <div
            className="mt-24 pt-16 border-t border-candera-stone/20"
            data-section="benefits-grid"
          >
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
