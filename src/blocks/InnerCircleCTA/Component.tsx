import React from 'react'
import Link from 'next/link'
import { Media } from '@/components/Media'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import type { InnerCircleCTABlock as InnerCircleCTABlockType } from '@/payload-types'

type Props = InnerCircleCTABlockType & { disableInnerContainer?: boolean }

const MailIcon: React.FC = () => (
  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

export const InnerCircleCTABlock: React.FC<Props> = ({
  headline,
  description,
  ctaLabel,
  ctaUrl,
  media,
}) => {
  return (
    <section className="flex flex-col md:flex-row min-h-[600px] border-t border-candera-stone/20">
      {/* Left editorial photo */}
      {media && typeof media === 'object' && (
        <div className="relative w-full md:w-1/2 min-h-[400px] md:min-h-full overflow-hidden bg-candera-ash">
          <Media fill imgClassName="object-cover transition-transform duration-[3s] hover:scale-110" resource={media} />
        </div>
      )}

      {/* Right content */}
      <div
        className="w-full md:w-1/2 flex flex-col items-start justify-center gap-8 px-12 md:px-24 py-20"
        style={{ background: 'var(--candera-vellum)' }}
      >
        <div className="text-candera-rose-strong/80">
          <MailIcon />
        </div>
        <div className="flex flex-col gap-4">
           <Eyebrow>The Inner Circle</Eyebrow>
           <h2 className="h2 text-candera-obsidian">
            {headline}
          </h2>
        </div>
        {description && (
          <p className="editorial text-[17px] leading-[1.8] text-candera-sage-text max-w-[400px]">
            {description}
          </p>
        )}
        {ctaLabel && ctaUrl && (
          <Button asChild variant="cta">
            <Link href={ctaUrl}>
              {ctaLabel}
            </Link>
          </Button>
        )}
      </div>
    </section>
  )
}
