import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { ContactForm } from '@/components/ContactForm'
import { EditorialPageHero } from '@/components/EditorialPageHero'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'
import { SetHeaderTheme } from '@/components/SetHeaderTheme'

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

  const contactFormId = formsResult.docs[0]?.id ?? 0

  return (
    <main className="bg-candera-vellum min-h-screen" data-page="contact">
      <SetHeaderTheme theme="dark" />

      <EditorialPageHero
        eyebrow="Candera Studio"
        title="Begin a conversation."
        description="We respond with intention — not automation. Expect a reply within 48 hours."
        decorativeWord="Studio"
        minHeight="52vh"
      >
        {/* Vertical ember rule — drops from nav, unique to the contact page */}
        <span
          className="absolute left-1/2 top-[var(--nav-height)] w-[1px] bg-candera-ember-strong/30 pointer-events-none"
          style={{ height: '4rem' }}
          aria-hidden="true"
        />
      </EditorialPageHero>

      {/* ── Content ────────────────────────────────────────────────── */}
      <Section padding="large" data-section="contact-content">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 max-w-[1000px] mx-auto">
            {/* Left — contact info */}
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-5">
                <h2
                  className="font-display italic text-candera-obsidian m-0"
                  style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)' }}
                >
                  Inquiries
                </h2>
                <p className="font-editorial italic text-[16px] text-candera-sage-text leading-[1.8] m-0">
                  For questions about your order, wholesale opportunities, or press — we&apos;d love
                  to hear from you.
                </p>
              </div>

              <span className="h-[1px] bg-candera-stone/20 block" aria-hidden="true" />

              {/* Contact detail items */}
              <dl className="flex flex-col gap-7">
                <div>
                  <dt className="font-sans text-[9px] font-bold uppercase tracking-[.3em] text-candera-sage-text mb-1.5">
                    Email
                  </dt>
                  <dd className="m-0">
                    <a
                      href="mailto:studio@canderacandles.com"
                      className="font-sans text-[16px] text-candera-obsidian hover:text-candera-ember-strong transition-colors"
                    >
                      studio@canderacandles.com
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="font-sans text-[9px] font-bold uppercase tracking-[.3em] text-candera-sage-text mb-1.5">
                    Social
                  </dt>
                  <dd className="m-0">
                    <a
                      href="https://instagram.com/canderacandles"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-sans text-[16px] text-candera-obsidian hover:text-candera-ember-strong transition-colors"
                    >
                      @canderacandles
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="font-sans text-[9px] font-bold uppercase tracking-[.3em] text-candera-sage-text mb-1.5">
                    Studio Hours
                  </dt>
                  <dd className="m-0">
                    <p className="font-sans text-[16px] text-candera-obsidian m-0">
                      By appointment — slow by design.
                    </p>
                  </dd>
                </div>
              </dl>

              {/* Footer note */}
              <div className="flex items-center gap-4 mt-auto pt-4">
                <span className="w-6 h-[1px] bg-candera-ember-strong" aria-hidden="true" />
                <span className="text-[9px] font-bold uppercase tracking-[.3em] text-candera-sage-text">
                  Handcrafted in California
                </span>
              </div>
            </div>

            {/* Right — form */}
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <h2
                  className="font-display italic text-candera-obsidian m-0"
                  style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)' }}
                >
                  Send a Note
                </h2>
                <span className="block w-8 h-[2px] bg-candera-ember-strong" aria-hidden="true" />
              </div>

              <ContactForm formId={contactFormId} />
            </div>
          </div>
        </Container>
      </Section>
    </main>
  )
}
