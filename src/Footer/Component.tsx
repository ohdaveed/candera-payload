import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Separator } from '@/components/ui/separator'

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()
  const allNavItems = footerData?.navItems || []

  // Filter out developer-oriented links from public navigation
  const navItems = allNavItems.filter(({ link }) => {
    const label = link.label?.toLowerCase()
    return !['admin', 'source code', 'payload'].includes(label)
  })

  return (
    <footer className="mt-auto bg-candera-linen border-t border-candera-stone/30 relative overflow-hidden">
      {/* Background Watermark */}
      <div
        aria-hidden="true"
        className="absolute bottom-[-1.5rem] right-[-0.5rem] font-display font-bold text-[180px] tracking-[-0.04em] text-candera-obsidian opacity-[0.03] leading-none pointer-events-none select-none"
      >
        CANDERA
      </div>

      <div className="container py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24">
          {/* Brand & Mission */}
          <div className="lg:col-span-1">
            <Link
              aria-label="Candera Home"
              className="font-display font-bold text-[20px] tracking-[-0.02em] text-candera-obsidian no-underline block mb-4"
              href="/"
            >
              CANDERA
            </Link>
            <p className="editorial text-[13px] text-candera-sage-text leading-relaxed max-w-[320px] text-pretty">
              Cultivating intentional living through scent and micro-batch artisanry. Based in the
              studio, shared everywhere.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h5 className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-candera-sage-text mb-6">
              Navigation
            </h5>
            <nav className="flex flex-col gap-3">
              {navItems.map(({ link }, i) => (
                <CMSLink
                  {...link}
                  className="font-sans text-[14px] font-light text-candera-obsidian no-underline hover:text-candera-ember-strong transition-colors focus-visible:ring-2 focus-visible:ring-candera-ember-strong focus-visible:ring-offset-2 outline-none rounded-sm"
                  key={i}
                />
              ))}
            </nav>
          </div>

          {/* Assistance */}
          <div>
            <h5 className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-candera-sage-text mb-6">
              Assistance
            </h5>
            <ul className="flex flex-col gap-3 list-none p-0 m-0">
              <li>
                <Link
                  href="/shipping-and-returns"
                  className="font-sans text-[14px] font-light text-candera-obsidian no-underline hover:text-candera-ember-strong transition-colors focus-visible:ring-2 focus-visible:ring-candera-ember-strong focus-visible:ring-offset-2 outline-none rounded-sm"
                >
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link
                  href="/wholesale"
                  className="font-sans text-[14px] font-light text-candera-obsidian no-underline hover:text-candera-ember-strong transition-colors focus-visible:ring-2 focus-visible:ring-candera-ember-strong focus-visible:ring-offset-2 outline-none rounded-sm"
                >
                  Wholesale
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="font-sans text-[14px] font-light text-candera-obsidian no-underline hover:text-candera-ember-strong transition-colors focus-visible:ring-2 focus-visible:ring-candera-ember-strong focus-visible:ring-offset-2 outline-none rounded-sm"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Settings / Theme */}
          <div>
            <h5 className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-candera-sage-text mb-6">
              Settings
            </h5>
            <ThemeSelector />
          </div>
        </div>

        {/* Bottom Bar */}
        <Separator className="bg-candera-stone/20 mt-20" />
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans text-[11px] font-light text-candera-sage-text">
            © {new Date().getFullYear()} Candera Studio. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy-policy"
              className="font-sans text-[11px] font-light text-candera-sage-text no-underline hover:text-candera-obsidian"
            >
              Privacy Policy
            </Link>
            <span className="text-candera-stone">·</span>
            <Link
              href="/terms-of-service"
              className="font-sans text-[11px] font-light text-candera-sage-text no-underline hover:text-candera-obsidian"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
