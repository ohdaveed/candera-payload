import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()
  const allNavItems = footerData?.navItems || []
  const assistanceItems = footerData?.assistanceItems || []
  const footerLinks = footerData?.footerLinks || []

  // Filter out developer-oriented links from public navigation
  const navItems = allNavItems.filter(({ link }) => {
    const label = link.label?.toLowerCase()
    return !['admin', 'source code', 'payload'].includes(label)
  })

  return (
    <Section
      as="footer"
      padding="none"
      className="mt-auto bg-candera-linen border-t border-candera-stone/30 relative overflow-hidden"
    >
      {/* Background Watermark */}
      <Section
        as="span"
        padding="none"
        aria-hidden="true"
        className="absolute bottom-[-1.5rem] right-[-0.5rem] font-display font-bold text-[180px] tracking-[-0.04em] text-candera-obsidian opacity-[0.03] leading-none pointer-events-none select-none"
      >
        CANDERA
      </Section>

      <Container className="py-20 relative z-10">
        <Section
          padding="none"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24"
        >
          {/* Brand & Mission */}
          <Section padding="none" className="lg:col-span-1">
            <Link
              aria-label="Candera Home"
              className="font-display font-bold text-xl tracking-display text-candera-obsidian no-underline block mb-4"
              href="/"
            >
              CANDERA
            </Link>
            <p className="body text-candera-sage-text max-w-[320px] text-pretty">
              Cultivating intentional living through scent and micro-batch artisanry. Based in the
              studio, shared everywhere.
            </p>
          </Section>

          {/* Navigation */}
          <Section padding="none">
            <h5 className="label text-candera-obsidian mb-6">Navigation</h5>
            <Section as="nav" padding="none" className="flex flex-col gap-0">
              {navItems.map(({ link }, i) => (
                <CMSLink
                  {...link}
                  className="body text-candera-obsidian no-underline hover:text-candera-ember-strong transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-candera-ember-strong focus-visible:ring-offset-2 outline-none rounded-sm min-h-[44px] flex items-center"
                  key={i}
                />
              ))}
            </Section>
          </Section>

          {/* Assistance */}
          <Section padding="none">
            <h5 className="label text-candera-obsidian mb-6">Assistance</h5>
            <Section as="nav" padding="none" className="flex flex-col gap-0">
              {assistanceItems.map(({ link }, i) => (
                <CMSLink
                  {...link}
                  className="body text-candera-obsidian no-underline hover:text-candera-ember-strong transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-candera-ember-strong focus-visible:ring-offset-2 outline-none rounded-sm min-h-[44px] flex items-center"
                  key={i}
                />
              ))}
            </Section>
          </Section>

          {/* Settings / Theme */}
          <Section padding="none">
            <h5 className="label text-candera-obsidian mb-6">Settings</h5>
            <ThemeSelector />
          </Section>
        </Section>

        {/* Bottom Bar */}
        <span className="block h-px bg-candera-stone/20 mt-20" aria-hidden="true" />
        <Section
          padding="none"
          className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="caption text-candera-sage-text">
            © {new Date().getFullYear()} Candera Studio. All rights reserved.
          </p>
          <Section as="nav" padding="none" className="flex gap-6">
            {footerLinks.map(({ link }, i) => (
              <CMSLink
                {...link}
                className="caption text-candera-sage-text no-underline hover:text-candera-obsidian transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-candera-ember-strong focus-visible:ring-offset-2 outline-none rounded-sm min-h-[44px] flex items-center"
                key={i}
              />
            ))}
          </Section>
        </Section>
      </Container>
    </Section>
  )
}
