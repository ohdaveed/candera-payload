import React from 'react'
import { cache } from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
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

export async function InnerCircleCTABlock({ headline, description }: Props) {
  const formId = await getInnerCircleFormId()

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 items-center bg-candera-obsidian p-6 md:p-[52px] gap-10 md:gap-[52px]">
      {/* Left — heading + body only, no bullets */}
      <div className="flex flex-col gap-[14px]">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="block w-6 h-px bg-candera-ember" aria-hidden="true" />
          <p className="font-sans text-[9px] font-bold uppercase tracking-[4px] text-[#6b5e50] m-0">
            Join the Inner Circle
          </p>
        </div>
        <h2 className="font-display text-[28px] text-candera-vellum leading-[1.2] m-0">
          {headline}
        </h2>
        {description && (
          <p className="font-sans text-[14px] leading-[1.75] m-0 text-[#a3a3a3]">{description}</p>
        )}
      </div>

      {/* Right — form + microcopy below */}
      <InnerCircleEmailForm formId={formId} />
    </section>
  )
}
