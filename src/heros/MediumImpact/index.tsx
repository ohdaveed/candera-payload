import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { FilmGrain } from '@/components/FilmGrain'

export const MediumImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  return (
    <header className="bg-candera-obsidian -mt-[var(--nav-height)]">
      <FilmGrain />

      {/* Text + links */}
      <Section padding="none" className="relative z-10">
        <Container className="pt-40 pb-16 max-w-[860px]">
          {/* Ember rule */}
          <span className="block w-8 h-px bg-candera-ember-strong mb-8" aria-hidden="true" />

          {richText && (
            <RichText
              className="mb-8
                [&_h1]:hero-heading [&_h1]:text-candera-vellum [&_h1]:mb-6
                [&_h2]:h2 [&_h2]:text-candera-vellum [&_h2]:mb-6
                [&_p]:editorial [&_p]:text-candera-vellum/70 [&_p]:max-w-[44ch]"
              data={richText}
              enableGutter={false}
            />
          )}

          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex flex-wrap gap-4 list-none p-0 m-0">
              {links.map(({ link }, i) => (
                <li key={i}>
                  <CMSLink {...link} appearance={i === 0 ? 'cta-inverse' : 'cta-ghost-dark'} />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>

      {/* Full-bleed image below text */}
      {media && typeof media === 'object' && (
        <figure className="m-0 relative z-10">
          <Media
            className="w-full"
            imgClassName="w-full object-cover max-h-[60vh]"
            priority
            resource={media}
          />
          {media?.caption && (
            <figcaption className="container py-6 editorial italic text-candera-stone/60 text-sm">
              <RichText data={media.caption} enableGutter={false} />
            </figcaption>
          )}
        </figure>
      )}
    </header>
  )
}
