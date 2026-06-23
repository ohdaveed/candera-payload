import type { Metadata } from 'next'
import { InnerCircleEmailForm } from '@/blocks/InnerCircleCTA/EmailForm'
import { getCachedFormByTitle } from '@/utilities/getForms'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { PageHeader } from '@/components/PageHeader'

const FALLBACK_BENEFITS = [
  {
    label: 'Early Access',
    description: '24-hour advance notice before every new batch goes public.',
  },
  {
    label: 'Ritual Invitations',
    description: 'Seasonal studio events and workshops, extended to members only.',
  },
  {
    label: 'Studio Notes',
    description: 'Behind-the-scenes updates from the curing room and new scent development.',
  },
]

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'The Inner Circle — Candera',
  description:
    'Join the Inner Circle for early access to every new batch before the public announcement.',
}

export default async function InnerCirclePage() {
  const [form, studioInfo] = await Promise.all([
    getCachedFormByTitle('Inner Circle Signup')(),
    getCachedGlobal('studio-info')(),
  ])
  const formId = form?.id?.toString() ?? ''

  const benefits =
    studioInfo?.innerCircleBenefits && studioInfo.innerCircleBenefits.length > 0
      ? studioInfo.innerCircleBenefits
      : FALLBACK_BENEFITS

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
            className="mb-14"
          />

          <div className="flex flex-col items-center gap-4">
            <InnerCircleEmailForm formId={formId} />
            <p className="caption text-candera-sage-text mt-2">No spam. Unsubscribe anytime.</p>
          </div>

          <div
            className="mt-24 pt-16 border-t border-candera-stone/20"
            data-section="benefits-grid"
          >
            <h2 className="h3 mb-10">What you&apos;ll receive</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
              {benefits.map((benefit, index) => (
                <div key={`${benefit.label}-${index}`}>
                  <p className="label text-candera-ember mb-3">{benefit.label}</p>
                  <p className="editorial">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
