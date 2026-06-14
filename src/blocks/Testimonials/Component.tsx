import React from 'react'
import type { TestimonialsBlock as TestimonialsBlockType } from '@/payload-types'

type Props = TestimonialsBlockType & { disableInnerContainer?: boolean }

export const TestimonialsBlock: React.FC<Props> = ({ eyebrow, items }) => {
  if (!items?.length) return null

  const [featured, ...rest] = items
  const secondary = rest.slice(0, 2)

  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: 'var(--candera-obsidian)',
      }}
    >
      {/* Left — featured quote */}
      <div
        style={{
          padding: '52px 48px',
          borderRight: '1px solid rgba(196,168,130,0.1)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
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
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {secondary.map((t, i) => (
          <div
            key={i}
            style={{
              padding: '30px 40px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              borderBottom: i < secondary.length - 1 ? '1px solid rgba(196,168,130,0.07)' : 'none',
            }}
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
