import React from 'react'
import type { TestimonialsBlock as TestimonialsBlockType } from '@/payload-types'

type Props = TestimonialsBlockType & { disableInnerContainer?: boolean }

const StarIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const CheckIcon: React.FC = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export const TestimonialsBlock: React.FC<Props> = ({ eyebrow, items }) => {
  if (!items?.length) return null

  return (
    <section className="py-20 px-6 bg-candera-linen">
      <div className="max-w-[1280px] mx-auto">
        {eyebrow && (
          <p className="text-center text-[10px] font-bold uppercase tracking-[.3em] text-candera-sage-text mb-12">
            {eyebrow}
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((t, i) => (
            <div
              key={i}
              className="border border-candera-stone/40 bg-white p-8 flex flex-col gap-4"
            >
              <div className="flex gap-1 text-candera-ember">
                {[...Array(5)].map((_, j) => <StarIcon key={j} />)}
              </div>
              <p className="font-editorial italic text-[17px] leading-[1.7] text-candera-obsidian flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex flex-col gap-1 mt-2">
                <p className="text-[12px] text-candera-sage-text font-medium">
                  — {t.author}{t.location ? `, ${t.location}` : ''}
                </p>
                {t.badge && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[.18em] text-candera-sage-text">
                    <CheckIcon />
                    {t.badge}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
