import React from 'react'
import { cache } from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { InnerCircleEmailForm } from './EmailForm'
import type { InnerCircleCTABlock as InnerCircleCTABlockType } from '@/payload-types'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'

type Props = InnerCircleCTABlockType

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

export async function InnerCircleCTABlock({ headline, description }: Props) {
  const formId = await getInnerCircleFormId()

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
