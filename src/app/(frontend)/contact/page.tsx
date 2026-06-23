import type { Metadata } from 'next'
import { ContactForm } from '@/components/ContactForm'
import { getCachedFormByTitle } from '@/utilities/getForms'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { EditorialPageHero } from '@/components/EditorialPageHero'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'
import { SetHeaderTheme } from '@/components/SetHeaderTheme'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Contact — Candera',
  description:
    'Reach out to Candera Studio for inquiries, wholesale, or just to share a moment of ritual.',
}

export default async function ContactPage() {
  const [contactForm, studioInfo] = await Promise.all([
    getCachedFormByTitle('Contact Form')(),
    getCachedGlobal('studio-info')(),
  ])
  const contactFormId = contactForm?.id ?? 0

  const email = studioInfo?.email || 'studio@canderacandles.com'
  const instagramHandle = studioInfo?.instagramHandle || '@canderacandles'
  const instagramUrl = studioInfo?.instagramUrl || 'https://instagram.com/canderacandles'
  const studioHours = studioInfo?.studioHours || 'By appointment — slow by design.'
  const locationTagline = studioInfo?.locationTagline || 'Handcrafted in California'

  return (
    <main className="bg-candera-vellum min-h-screen" data-page="contact">
      <SetHeaderTheme theme="dark" />

      <EditorialPageHero
        eyebrow="Candera Studio"
        title="Begin a conversation."
        description="We respond with intention — not automation. Expect a reply within 48 hours."
        decorativeWord="Studio"
        minHeightClass="min-h-[52vh]"
      >
        {/* Vertical ember rule — drops from nav, unique to the contact page */}
        <span
          className="absolute left-1/2 top-[var(--nav-height)] w-[1px] h-[4rem] bg-candera-ember-strong/30 pointer-events-none"
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
                <h2 className="h3">Inquiries</h2>
                <p className="editorial">
                  For questions about your order, wholesale opportunities, or press — we&apos;d love
                  to hear from you.
                </p>
              </div>

              <span className="h-[1px] bg-candera-stone/20 block" aria-hidden="true" />

              {/* Contact detail items */}
              <dl className="flex flex-col gap-7">
                <div>
                  <dt className="label">Email</dt>
                  <dd className="m-0">
                    <a
                      href={`mailto:${email}`}
                      className="body hover:text-candera-ember-strong transition-colors"
                    >
                      {email}
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="label">Social</dt>
                  <dd className="m-0">
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="body hover:text-candera-ember-strong transition-colors"
                    >
                      {instagramHandle}
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="label">Studio Hours</dt>
                  <dd className="m-0">
                    <p className="body">{studioHours}</p>
                  </dd>
                </div>
              </dl>

              {/* Footer note */}
              <div className="flex items-center gap-4 mt-auto pt-4">
                <span className="w-6 h-[1px] bg-candera-ember-strong" aria-hidden="true" />
                <span className="eyebrow">{locationTagline}</span>
              </div>
            </div>

            {/* Right — form */}
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <h2 className="h3">Send a Note</h2>
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
