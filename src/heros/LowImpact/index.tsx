import React from 'react'

import type { Page } from '@/payload-types'

import RichText from '@/components/RichText'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'

type LowImpactHeroType =
  | {
      children?: React.ReactNode
      richText?: never
    }
  | (Omit<Page['hero'], 'richText'> & {
      children?: never
      richText?: Page['hero']['richText']
    })

export const LowImpactHero: React.FC<LowImpactHeroType> = ({ children, richText }) => {
  return (
    <Section
      padding="none"
      className="bg-candera-vellum pt-32 md:pt-36 pb-16 md:pb-24 border-b border-candera-stone/20"
    >
      <Container className="max-w-[800px] text-center">
        {/* We use a specialized rich text styling wrapper for the low impact hero to enforce editorial scale */}
        <div className="[&_h1]:text-[clamp(2.5rem,5.5vw,4.25rem)] [&_h1]:leading-[1.1] [&_h1]:mb-8 [&_p]:font-editorial [&_p]:italic [&_p]:text-candera-sage-text [&_p]:leading-relaxed [&_p]:max-w-[620px] [&_p]:mx-auto">
          {children || (richText && <RichText data={richText} enableGutter={false} />)}
        </div>
      </Container>
    </Section>
  )
}
