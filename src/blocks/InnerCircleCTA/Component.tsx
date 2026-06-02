import React from 'react'
import Link from 'next/link'
import { Media } from '@/components/Media'
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
    <section className="flex flex-col md:flex-row min-h-[480px]">
      {/* Left editorial photo */}
      {media && typeof media === 'object' && (
        <div className="relative w-full md:w-1/2 min-h-[300px] md:min-h-full overflow-hidden">
          <Media fill imgClassName="object-cover" resource={media} />
        </div>
      )}

      {/* Right content */}
      <div
        className="w-full md:w-1/2 flex flex-col items-start justify-center gap-6 px-12 py-16"
        style={{ background: '#f5f2ed' }}
      >
        <div className="text-candera-rose">
          <MailIcon />
        </div>
        <h2
          className="font-display font-thin italic text-candera-obsidian leading-[1.1] m-0"
          style={{ fontSize: 'clamp(1.75rem, 3vw, 2.75rem)' }}
        >
          {headline}
        </h2>
        {description && (
          <p className="font-editorial text-[17px] leading-[1.7] text-candera-sage-text max-w-[380px]">
            {description}
          </p>
        )}
        {ctaLabel && ctaUrl && (
          <Link
            href={ctaUrl}
            className="inline-flex items-center justify-center h-[46px] px-7 text-[11px] font-bold uppercase tracking-[.2em] bg-candera-ember-strong text-white transition-colors hover:bg-candera-obsidian"
            style={{ borderRadius: 0 }}
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  )
}
