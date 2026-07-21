import { RequiredDataFromCollectionSlug } from 'payload'

// Real, user-confirmed 2026 event calendar (candera-payload session, 2026-07-20 —
// see plans/03-botanical-lavender-reskin-and-events.md Phase 4D). 7/11 is already
// past as of authoring; seeded anyway as an archival record — the /events route
// filters to upcoming entries at query time.
export const events: () => RequiredDataFromCollectionSlug<'events'>[] = () => [
  {
    slug: 'humble-sea-brewery-alameda-7-11',
    _status: 'published',
    venueName: 'Humble Sea Brewery',
    eventDate: '2026-07-11',
    timeRange: '12PM – 5PM',
    address: 'Humble Sea Brewing',
    city: 'Alameda, CA',
    mapUrl: 'https://maps.google.com/?q=Humble+Sea+Brewery+Alameda+CA',
    blurb:
      'Our summer kickoff — pressed-flower pillars, seasonal scents, and cold beer in good company.',
  },
  {
    slug: 'age-well-center-lake-elizabeth-fremont-7-31',
    _status: 'published',
    venueName: 'Age Well Center at Lake Elizabeth',
    eventDate: '2026-07-31',
    timeRange: '4PM – 9PM',
    address: 'Age Well Center at Lake Elizabeth',
    city: 'Fremont, CA',
    mapUrl: 'https://maps.google.com/?q=Age+Well+Center+at+Lake+Elizabeth+Fremont+CA',
    blurb: 'An evening at the lake — browse one-of-a-kind designs made with real botanicals.',
  },
  {
    slug: 'castro-valley-marketplace-8-7',
    _status: 'published',
    venueName: 'Castro Valley Marketplace (CVM)',
    eventDate: '2026-08-07',
    timeRange: '5PM – 8PM',
    address: '3295 Castro Valley Blvd.',
    city: 'Castro Valley, CA',
    mapUrl: 'https://maps.google.com/?q=3295+Castro+Valley+Blvd+Castro+Valley+CA',
    blurb: 'An evening market under the string lights — meet the maker and shop the newest pours.',
  },
  {
    slug: 'headlands-brewing-uc-berkeley-8-21',
    _status: 'published',
    venueName: 'Headlands Brewing',
    eventDate: '2026-08-21',
    timeRange: '5:30PM – 8:30PM',
    address: 'Headlands Brewing',
    city: 'UC Berkeley, Berkeley, CA',
    mapUrl: 'https://maps.google.com/?q=Headlands+Brewing+UC+Berkeley+CA',
    blurb: 'A campus-side pop-up — seasonal scents and pressed-flower candles to close out summer.',
  },
  {
    slug: 'orinda-theatre-square-9-4',
    _status: 'published',
    venueName: 'Orinda Theatre Square',
    eventDate: '2026-09-04',
    timeRange: '5:30PM – 8:30PM',
    address: 'Orinda Theatre Square',
    city: 'Orinda, CA',
    mapUrl: 'https://maps.google.com/?q=Orinda+Theatre+Square+Orinda+CA',
    blurb: 'First Friday in the square — discover the newest seasonal collection under the lights.',
  },
  {
    slug: 'humble-sea-brewing-alameda-10-10',
    _status: 'published',
    venueName: 'Humble Sea Brewing',
    eventDate: '2026-10-10',
    timeRange: '12PM – 5PM',
    address: 'Humble Sea Brewing',
    city: 'Alameda, CA',
    mapUrl: 'https://maps.google.com/?q=Humble+Sea+Brewing+Alameda+CA',
    blurb: 'An autumn afternoon by the water — warm, cozy scents for the season ahead.',
  },
  {
    slug: 'silverado-resort-and-spa-napa-11-14',
    _status: 'published',
    venueName: 'Silverado Resort and Spa',
    eventDate: '2026-11-14',
    eventEndDate: '2026-11-15',
    timeRange: '11AM – 4PM',
    address: 'Silverado Resort and Spa',
    city: 'Napa, CA',
    mapUrl: 'https://maps.google.com/?q=Silverado+Resort+and+Spa+Napa+CA',
    blurb:
      'A two-day holiday showcase in wine country — perfect for early gifting and cozy seasonal scents.',
  },
]
