import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { Fraunces, DM_Sans, EB_Garamond } from 'next/font/google'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { GlobalLayout } from '@/components/GlobalLayout'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { normalizeSiteThemeSettings } from '@/utilities/siteTheme'
import { draftMode } from 'next/headers'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from '@/components/ui/sonner'
import { BackToTop } from '@/components/BackToTop'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'
import { getCachedGlobal } from '@/utilities/getGlobals'

const fraunces = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '500'],
  variable: '--font-eb-garamond',
  display: 'swap',
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()
  const siteTheme = await getCachedGlobal('site-theme')()
  const theme = normalizeSiteThemeSettings(siteTheme)

  return (
    <html
      className={cn(
        GeistMono.variable,
        fraunces.variable,
        dmSans.variable,
        ebGaramond.variable,
        'scroll-smooth',
      )}
      data-fontset={theme.fontSet}
      data-skin={theme.colorScheme}
      data-hero-layout={theme.heroLayout}
      data-product-card-density={theme.productCardDensity}
      data-section-mood={theme.sectionMood}
      data-cta-style={theme.ctaStyle}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body className="candera">
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />

          <a
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:shadow-lg"
            href="#main-content"
          >
            Skip to Main Content
          </a>
          <GlobalLayout>{children}</GlobalLayout>
        </Providers>
        <BackToTop />
        <Toaster position="bottom-right" richColors />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@canderacandles',
  },
}
