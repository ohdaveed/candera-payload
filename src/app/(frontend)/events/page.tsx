import type { Metadata } from 'next/types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { EditorialPageHero } from '@/components/EditorialPageHero'
import { SetHeaderTheme } from '@/components/SetHeaderTheme'
import { BoutiqueLink } from '@/components/EtsyHandshake/BoutiqueLink'
import { ETSY_SHOP_URL } from '@/lib/etsy'
import { listingMetadata } from '@/utilities/listing'

import { cacheLife } from 'next/cache'

const EVENTS_TIME_ZONE = 'America/Los_Angeles'

// Events are scheduled in Pacific local time. Deriving "today" via toISOString() (UTC) would
// roll the cutoff to the next calendar date up to 8 hours before it's actually tomorrow in
// California, dropping same-day evening events from the listing mid-event.
function todayInTimeZone(timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${map.year}-${map.month}-${map.day}`
}

function formatDateRange(eventDate: string, eventEndDate?: string | null): string {
  const start = new Date(eventDate)
  const startLabel = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
  if (!eventEndDate) return startLabel
  const end = new Date(eventEndDate)
  const endLabel = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
  return startLabel + ' – ' + endLabel
}

export default async function Page() {
  'use cache'
  cacheLife({ expire: 600 })

  const payload = await getPayload({ config: configPromise })
  const todayISO = todayInTimeZone(EVENTS_TIME_ZONE)

  const events = await payload.find({
    collection: 'events',
    depth: 0,
    limit: 50,
    overrideAccess: false,
    sort: 'eventDate',
    where: {
      or: [
        {
          and: [
            { eventEndDate: { exists: true } },
            { eventEndDate: { greater_than_equal: todayISO } },
          ],
        },
        {
          and: [
            { eventEndDate: { exists: false } },
            { eventDate: { greater_than_equal: todayISO } },
          ],
        },
      ],
    },
    select: {
      venueName: true,
      slug: true,
      eventDate: true,
      eventEndDate: true,
      timeRange: true,
      address: true,
      city: true,
      mapUrl: true,
      blurb: true,
    },
  })

  return (
    <main className="bg-candera-vellum overflow-x-hidden" data-page="events-listing">
      <SetHeaderTheme theme="dark" />

      <EditorialPageHero
        eyebrow="Come find us in person"
        title="Upcoming Events"
        description="Handcrafted botanical candles, market stalls, and pop-ups across the Bay Area."
        decorativeWord="Events"
      />

      <Section
        padding="large"
        className="bg-candera-vellum pt-8 md:pt-12"
        data-section="events-archive"
      >
        <Container>
          {events.docs.length === 0 ? (
            <output aria-live="polite" className="block py-24 text-center">
              <p className="text-lg text-candera-obsidian">No upcoming events right now.</p>
              <p className="text-sm text-candera-sage-text mt-2">
                Check back soon, or shop the collection on{' '}
                <BoutiqueLink
                  href={ETSY_SHOP_URL}
                  location="events-empty-state"
                  className="text-candera-ember-strong underline underline-offset-2 hover:text-candera-obsidian transition-colors"
                >
                  Etsy
                </BoutiqueLink>
                .
              </p>
            </output>
          ) : (
            <ul className="flex flex-col gap-6 list-none p-0 m-0 mt-8">
              {events.docs.map((event) => (
                <li
                  key={event.slug}
                  className="border border-candera-stone bg-candera-field p-6 md:p-8 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 md:gap-8 items-start"
                >
                  <div className="font-display text-3xl text-candera-obsidian whitespace-nowrap">
                    {formatDateRange(event.eventDate, event.eventEndDate)}
                  </div>
                  <div>
                    <h2 className="font-display text-2xl text-candera-obsidian">
                      {event.venueName}
                    </h2>
                    <p className="text-sm text-candera-sage-text mt-1">
                      {event.timeRange} · {event.address}, {event.city}
                    </p>
                    {event.blurb && (
                      <p className="text-sm text-candera-obsidian mt-3 max-w-prose">
                        {event.blurb}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-4">
                      {event.mapUrl && (
                        <a
                          href={event.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs uppercase tracking-[0.18em] px-5 py-3 bg-candera-obsidian text-candera-vellum focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          View venue ↗
                        </a>
                      )}
                      <BoutiqueLink
                        href={ETSY_SHOP_URL}
                        location="events-card"
                        className="text-xs uppercase tracking-[0.18em] px-5 py-3 border border-candera-stone text-candera-obsidian focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        Shop the collection ↗
                      </BoutiqueLink>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>
    </main>
  )
}

export function generateMetadata(): Metadata {
  return listingMetadata({
    titlePrefix: 'Upcoming Events',
    description:
      'Find Candera Candles in person — Bay Area markets, pop-ups, and seasonal showcases.',
    basePath: '/events',
  })
}
