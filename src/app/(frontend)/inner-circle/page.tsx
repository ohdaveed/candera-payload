import type { Metadata } from 'next'
import { InnerCircleEmailForm } from '@/blocks/InnerCircleCTA/EmailForm'
import { getCachedFormByTitle } from '@/utilities/getForms'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { EditorialPageHero } from '@/components/EditorialPageHero'
import { SetHeaderTheme } from '@/components/SetHeaderTheme'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'
import { FORM_TITLES } from '@/constants/forms'
import { DEFAULT_INNER_CIRCLE_BENEFITS } from '@/constants/innerCircle'

import { cacheLife } from 'next/cache'

export const metadata: Metadata = {
  title: 'The Inner Circle — Candera',
  description:
    'Join the Inner Circle for early access to every new batch before the public announcement.',
}

export default async function InnerCirclePage() {
  'use cache'
  cacheLife({ expire: 3600 })

  const [form, studioInfo] = await Promise.all([
    getCachedFormByTitle(FORM_TITLES.INNER_CIRCLE)(),
    getCachedGlobal('studio-info')(),
  ])
  const formId = form?.id?.toString() ?? ''

  const benefits =
    studioInfo?.innerCircleBenefits && studioInfo.innerCircleBenefits.length > 0
      ? studioInfo.innerCircleBenefits
      : DEFAULT_INNER_CIRCLE_BENEFITS

  return (
    <main className="min-h-screen bg-candera-vellum" data-page="inner-circle">
      <SetHeaderTheme theme="dark" />

      <EditorialPageHero
        eyebrow="The Inner Circle"
        title="Be the first to know."
        description="Our studio doors are opening. Join the Inner Circle for advance notice of new arrivals, studio updates, and seasonal ritual invitations."
        decorativeWord="Circle"
      />

      <Section padding="large" data-section="inner-circle-signup">
        <Container>
          <div className="max-w-[600px] mx-auto text-center">
            <div className="bg-candera-obsidian p-8 md:p-10">
              <InnerCircleEmailForm formId={formId} />
            </div>

            <div
              className="mt-24 pt-16 border-t border-candera-stone/20"
              data-section="benefits-grid"
            >
              <h2 className="h3 mb-10">What you&apos;ll receive</h2>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left list-none p-0 m-0">
                {benefits.map((benefit, index) => (
                  <li key={`${benefit.label}-${index}`}>
                    <p className="label text-candera-ember mb-3">{benefit.label}</p>
                    <p className="editorial">{benefit.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  )
}
