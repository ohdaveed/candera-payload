import React from 'react'
import { InnerCircleEmailForm } from './EmailForm'
import type { InnerCircleCTABlock as InnerCircleCTABlockType } from '@/payload-types'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'
import { getCachedFormByTitle } from '@/utilities/getForms'
import { FORM_TITLES } from '@/constants/forms'

type Props = InnerCircleCTABlockType

export async function InnerCircleCTABlock({ headline, description }: Props) {
  const form = await getCachedFormByTitle(FORM_TITLES.INNER_CIRCLE)()
  const formId = form?.id?.toString() ?? ''

  return (
    <Section padding="none" className="bg-candera-obsidian">
      <Container className="py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-16">
          {/* Left — heading + body only (spans columns 1-6) */}
          <div className="lg:col-span-6 flex flex-col gap-3.5">
            <h2 className="h2 text-candera-vellum m-0">{headline}</h2>
            {description && <p className="body text-candera-vellum/70 m-0">{description}</p>}
          </div>

          {/* Right — form (spans columns 7-12) */}
          <div className="lg:col-span-6 w-full">
            <InnerCircleEmailForm formId={formId} />
          </div>
        </div>
      </Container>
    </Section>
  )
}
