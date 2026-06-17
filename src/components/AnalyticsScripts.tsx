'use client'

import nextDynamic from 'next/dynamic'

const Analytics = nextDynamic(() => import('@vercel/analytics/react').then((m) => m.Analytics), {
  ssr: false,
})
const SpeedInsights = nextDynamic(
  () => import('@vercel/speed-insights/next').then((m) => m.SpeedInsights),
  { ssr: false },
)

export function AnalyticsScripts() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  )
}
