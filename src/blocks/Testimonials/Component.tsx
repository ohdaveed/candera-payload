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
      <div className="p-6 md:p-12 border-b md:border-b-0 md:border-r border-candera-stone/10 flex flex-col justify-center">
        {eyebrow && <p className="eyebrow text-candera-stone mb-6">{eyebrow}</p>}
        {featured && (
          <>
            <p
              className="font-display text-candera-ember m-0 leading-[0.7] text-6xl opacity-20"
              aria-hidden="true"
            >
              &ldquo;
            </p>
            <blockquote className="m-0 mt-3">
              <p className="h3 text-candera-vellum m-0">&ldquo;{featured.quote}&rdquo;</p>
            </blockquote>
            <p className="label text-candera-ember m-0 mt-5">
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
            className={`px-6 py-[30px] md:px-10 flex-1 flex flex-col justify-center${i < secondary.length - 1 ? ' border-b border-candera-stone/5' : ''}`}
          >
            <blockquote className="m-0">
              <p className="editorial text-candera-stone m-0">&ldquo;{t.quote}&rdquo;</p>
            </blockquote>
            <p className="label text-candera-sage-text m-0 mt-2">
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
