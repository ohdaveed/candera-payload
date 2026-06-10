import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'

export const MediumImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  return (
    <header>
      <Section padding="large">
        <Container className="mb-8">
          {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}

          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex gap-4 list-none p-0">
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink {...link} />
                  </li>
                )
              })}
            </ul>
          )}
        </Container>
        <Container>
          {media && typeof media === 'object' && (
            <figure className="m-0">
              <Media
                className="-mx-4 md:-mx-8 2xl:-mx-16"
                imgClassName=""
                priority
                resource={media}
              />
              {media?.caption && (
                <figcaption className="mt-3">
                  <RichText data={media.caption} enableGutter={false} />
                </figcaption>
              )}
            </figure>
          )}
        </Container>
      </Section>
    </header>
  )
}
