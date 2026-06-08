import type { Metadata } from 'next'
import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Eyebrow } from '@/components/ui/eyebrow'
import { ContactForm } from '@/components/ContactForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Contact — Candera',
  description:
    'Reach out to Candera Studio for inquiries, wholesale, or just to share a moment of ritual.',
}

export default async function ContactPage() {
  const payload = await getPayload({ config: configPromise })

  const formsResult = await payload.find({
    collection: 'forms',
    where: { title: { equals: 'Contact Form' } },
    limit: 1,
    depth: 0,
  })

  const contactFormId = formsResult.docs[0]?.id?.toString() ?? ''

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

            {/* Right column — contact form */}
            <div className="relative bg-candera-vellum/50 p-10 border border-candera-stone/20 rounded-sm border-l-2 border-l-candera-ember">
              <h2 className="font-display text-2xl mb-8">Send a Note</h2>
              <ContactForm formId={contactFormId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
