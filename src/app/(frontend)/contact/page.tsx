import type { Metadata } from 'next'
import React from 'react'
import { Eyebrow } from '@/components/ui/eyebrow'

export const metadata: Metadata = {
  title: 'Contact — Candera',
  description:
    'Reach out to Candera Studio for inquiries, wholesale, or just to share a moment of ritual.',
}

export const dynamic = 'force-static'

export default function ContactPage() {
  return (
    <div className="pt-32 pb-32 bg-candera-linen min-h-screen">
      <div className="container">
        <div className="max-w-[800px] mx-auto">
          <Eyebrow className="block mb-4 text-center">Get in Touch</Eyebrow>
          <h1 className="hero-heading text-candera-obsidian text-center mb-12">
            Connect with the Studio
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-20">
            {/* Left column — contact info */}
            <div>
              <h2 className="font-display text-2xl mb-6">Inquiries</h2>
              <p className="editorial text-candera-sage-text leading-relaxed mb-10">
                For questions regarding your order, wholesale opportunities, or press inquiries,
                please reach out to us. We strive to respond within 48 hours, though we favor a
                slower pace in the studio.
              </p>

              <div className="flex flex-col gap-6">
                <div>
                  <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-candera-sage-text block mb-1">
                    Email
                  </span>
                  <a
                    href="mailto:studio@canderacandles.com"
                    className="font-sans text-lg text-candera-obsidian hover:text-candera-ember-strong transition-colors"
                  >
                    studio@canderacandles.com
                  </a>
                </div>

                <div>
                  <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-candera-sage-text block mb-1">
                    Social
                  </span>
                  <a
                    href="https://instagram.com/canderacandles"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-lg text-candera-obsidian hover:text-candera-ember-strong transition-colors"
                  >
                    @canderacandles
                  </a>
                </div>

                <div>
                  <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-candera-sage-text block mb-1">
                    Studio Hours
                  </span>
                  <p className="font-sans text-lg text-candera-obsidian">
                    By appointment — slow by design.
                  </p>
                </div>
              </div>
            </div>

            {/* Right column — form placeholder panel */}
            <div className="relative bg-candera-vellum/50 p-10 border border-candera-stone/20 rounded-sm border-l-2 border-l-candera-ember">
              <h2 className="font-display text-2xl mb-6">Send a Note</h2>
              <p className="editorial text-sm text-candera-sage-text mb-10">
                The contact form is currently being cured in the studio. In the meantime, please
                reach out via email — we read every note.
              </p>

              {/* Wax-seal decorative element */}
              <div className="flex flex-col items-center gap-6 py-4">
                <svg
                  width="72"
                  height="72"
                  viewBox="0 0 72 72"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  {/* Outer decorative dashed ring */}
                  <circle
                    cx="36"
                    cy="36"
                    r="34"
                    stroke="var(--color-candera-ember)"
                    strokeOpacity="0.4"
                    strokeWidth="1"
                    strokeDasharray="4 3"
                  />
                  {/* Wax-seal inner circle */}
                  <circle
                    cx="36"
                    cy="36"
                    r="26"
                    fill="var(--color-candera-ember)"
                    fillOpacity="0.1"
                    stroke="var(--color-candera-ember)"
                    strokeOpacity="0.4"
                    strokeWidth="1"
                  />
                  {/* Flame outline */}
                  <path
                    d="M36 20 C36 20 42 26 42 32 C42 38.627 39.314 42 36 42 C32.686 42 30 38.627 30 32 C30 26 36 20 36 20Z"
                    fill="none"
                    stroke="var(--color-candera-ember-strong)"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Flame inner glow */}
                  <path
                    d="M36 30 C36 30 38.5 32.5 38.5 34.5 C38.5 36.5 37.5 38 36 38 C34.5 38 33.5 36.5 33.5 34.5 C33.5 32.5 36 30 36 30Z"
                    fill="var(--color-candera-ember)"
                    fillOpacity="0.6"
                  />
                </svg>

                <p className="font-sans text-[11px] italic text-candera-sage-text text-center max-w-[200px]">
                  &ldquo;Scent is the most intense form of memory.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
