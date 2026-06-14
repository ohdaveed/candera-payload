import React from 'react'
import type { TestimonialsBlock as TestimonialsBlockType } from '@/payload-types'

type Props = TestimonialsBlockType & { disableInnerContainer?: boolean }

export const TestimonialsBlock: React.FC<Props> = ({ eyebrow, items }) => {
  if (!items?.length) return null

  const [featured, ...rest] = items
  const secondary = rest.slice(0, 2)

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 bg-candera-obsidian">
      {/* Left — featured quote */}
      <div className="p-6 md:p-12 border-b md:border-b-0 md:border-r border-[rgba(196,168,130,0.1)] flex flex-col justify-center">
        {eyebrow && (
          <p className="font-sans text-[9px] font-bold uppercase tracking-[4px] text-[#6b5e50] m-0 mb-6">
            {eyebrow}
          </p>
        )}
        {featured && (
          <>
            <p
              className="font-display text-candera-ember m-0 leading-[0.7]"
              style={{ fontSize: '56px', opacity: 0.18 }}
              aria-hidden="true"
            >
              &ldquo;
            </p>
            <blockquote className="m-0 mt-3">
              <p className="font-display italic text-[20px] text-candera-vellum leading-[1.6] m-0">
                &ldquo;{featured.quote}&rdquo;
              </p>
            </blockquote>
            <p className="font-sans text-[9px] font-bold uppercase tracking-[2px] text-candera-ember m-0 mt-5">
              {featured.author}
              {featured.location ? ` — ${featured.location}` : ''}
              {featured.badge ? ` · ${featured.badge}` : ''}
            </p>
          </>
        )}
      </div>

      {/* Right — two stacked secondary quotes */}
      <div className="flex flex-col">
        {secondary.map((t, i) => (
          <div
            key={i}
            className={`px-6 py-[30px] md:px-10 flex-1 flex flex-col justify-center${i < secondary.length - 1 ? ' border-b border-[rgba(196,168,130,0.07)]' : ''}`}
          >
            <blockquote className="m-0">
              <p className="font-display italic text-[13px] text-[#b0a090] leading-[1.65] m-0">
                &ldquo;{t.quote}&rdquo;
              </p>
            </blockquote>
            <p className="font-sans text-[8px] font-bold uppercase tracking-[2px] text-[#6b5e50] m-0 mt-2">
              {t.author}
              {t.location ? ` — ${t.location}` : ''}
              {t.badge ? ` · ${t.badge}` : ''}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
