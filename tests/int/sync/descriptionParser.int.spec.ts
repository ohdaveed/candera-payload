// tests/int/sync/descriptionParser.int.spec.ts
// Unit tests for the pure string-parsing helpers extracted from the Etsy sync
// engine. No DB or network required — these are pure functions of their input.
import { describe, it, expect } from 'vite-plus/test'
import {
  deriveCleanTitle,
  cleanEtsyDescription,
  slugify,
  unescapeHtml,
  parseEtsyDescription,
} from '@/utilities/sync/descriptionParser'

describe('unescapeHtml', () => {
  it('unescapes the common HTML entities', () => {
    expect(unescapeHtml('Fire &amp; Ice &lt;3 &quot;Cozy&quot; &#39;n warm&nbsp;nights')).toBe(
      'Fire & Ice <3 "Cozy" \'n warm nights',
    )
  })

  it('leaves unknown entities untouched', () => {
    expect(unescapeHtml('&copy; 2026 Candera')).toBe('&copy; 2026 Candera')
  })

  it('passes through text without entities', () => {
    expect(unescapeHtml('Plain candle title')).toBe('Plain candle title')
  })
})

describe('deriveCleanTitle', () => {
  it('takes the first segment of a keyword-stuffed pipe-delimited title', () => {
    expect(deriveCleanTitle("Anya's Eyes Candle | Hand Poured | Gift for Her")).toBe(
      "Anya's Eyes Candle",
    )
  })

  it('unescapes HTML entities before splitting', () => {
    expect(deriveCleanTitle('Anya&#39;s Eyes Candle | Hand Poured')).toBe("Anya's Eyes Candle")
  })

  it('splits on " - ", commas, colons, and en/em dashes', () => {
    expect(deriveCleanTitle('Lavender Candle - Soy Wax Gift')).toBe('Lavender Candle')
    expect(deriveCleanTitle('Lavender Candle, Soy Wax, Gift')).toBe('Lavender Candle')
    expect(deriveCleanTitle('Lavender Candle: Soy Wax')).toBe('Lavender Candle')
    expect(deriveCleanTitle('Lavender Candle – Soy Wax')).toBe('Lavender Candle')
  })

  it('caps a long undelimited keyword run at the first 8 words', () => {
    expect(
      deriveCleanTitle(
        'Handmade Botanical Soy Wax Candle Lavender Vanilla Amber Gift Idea Home Decor',
      ),
    ).toBe('Handmade Botanical Soy Wax Candle Lavender Vanilla Amber')
  })

  it('keeps a first segment of exactly 60 characters or fewer intact', () => {
    const title = 'Moonlit Grove Botanical Candle in Vintage Amber Glass Vessel'
    expect(title.length).toBe(60)
    expect(deriveCleanTitle(title)).toBe(title)
  })

  it('collapses repeated whitespace inside the segment', () => {
    expect(deriveCleanTitle('Moonlit   Grove    Candle')).toBe('Moonlit Grove Candle')
  })

  it('falls back to the unescaped title when the first segment is empty', () => {
    expect(deriveCleanTitle('| Hand Poured')).toBe('| Hand Poured')
  })
})

describe('slugify', () => {
  it('mirrors Payload slugify: lowercase, spaces to dashes, strip non-word chars', () => {
    expect(slugify("Anya's Eyes Candle")).toBe('anyas-eyes-candle')
  })

  it('trims but preserves each interior space as a dash', () => {
    expect(slugify('  Hi There  ')).toBe('hi-there')
    expect(slugify('a  b')).toBe('a--b')
  })

  it('drops symbols entirely, leaving adjacent dashes', () => {
    expect(slugify('Fire & Ice!')).toBe('fire--ice')
  })

  it('returns an empty string for empty input', () => {
    expect(slugify('')).toBe('')
  })
})

describe('cleanEtsyDescription', () => {
  it('returns an empty string for empty input', () => {
    expect(cleanEtsyDescription('')).toBe('')
  })

  it('unescapes HTML entities', () => {
    expect(cleanEtsyDescription('Fire &amp; Ice')).toBe('Fire & Ice')
  })

  it('removes dash separators of 3+ characters', () => {
    expect(cleanEtsyDescription('Part one\n--------\nPart two')).toBe('Part one\n\nPart two')
  })

  it('strips promotional phrases and Etsy shop links', () => {
    const raw = [
      'A lovely candle.',
      'Please visit my store for more fantastic items to buy!',
      'Visit my shop at: https://www.etsy.com/ca/shop/canderacandles',
    ].join('\n')
    expect(cleanEtsyDescription(raw)).toBe('A lovely candle.')
  })

  it('collapses 3+ newlines into a blank line and trims the result', () => {
    expect(cleanEtsyDescription('  First\n\n\n\nSecond  ')).toBe('First\n\nSecond')
  })
})

describe('parseEtsyDescription', () => {
  const fixture = [
    'A cozy hand-poured soy candle inspired by quiet evenings.',
    '',
    'Product Details:',
    '• Burn time: 40 hours',
    '• Vessel: Amber glass jar',
    '• Weight: 8 oz',
    '• Weight with box: 650 g',
    '• Boxwood lid: Yes',
    '• Box dimensions:',
    '• Length: 4 in',
    '• Width: 4 in',
    '• Height: 5 in',
    'Wick: Cotton',
    '',
    'Scent Profile:',
    'Top: Bergamot',
    'Heart: Lavender',
    'Base: Sandalwood',
    '',
    'Shipping:',
    'Ships worldwide in 3-5 business days.',
  ].join('\n')

  it('parses a realistic structured Etsy description', () => {
    const result = parseEtsyDescription('Cozy Evenings Candle', fixture)

    expect(result.tagline).toBe('A cozy hand-poured soy candle inspired by quiet evenings.')
    expect(result.burnTime).toBe('40 hours')
    expect(result.vessel).toBe('Amber glass jar')
    expect(result.scentProfile).toEqual({
      top: 'Bergamot',
      heart: 'Lavender',
      base: 'Sandalwood',
    })
    // Shipping/box logistics are dropped (Weight with box, Box dimensions'
    // Length/Width/Height); "Boxwood lid" survives the word-boundary check.
    expect(result.specifications).toEqual([
      { label: 'Weight', value: '8 oz' },
      { label: 'Boxwood lid', value: 'Yes' },
      { label: 'Wick', value: 'Cotton' },
    ])
  })

  it('prefixes dimensions with their non-shipping heading', () => {
    const description = [
      'Product details:',
      'Vessel size:',
      '• Height: 10 cm',
      '• Width: 8 cm',
    ].join('\n')
    const result = parseEtsyDescription('Candle', description)
    expect(result.specifications).toEqual([
      { label: 'Vessel size Height', value: '10 cm' },
      { label: 'Vessel size Width', value: '8 cm' },
    ])
  })

  it('parses comma-separated scent notes without labels', () => {
    const description = ['Fragrance Notes:', 'Bergamot, Lavender, Cedarwood'].join('\n')
    const result = parseEtsyDescription('Candle', description)
    expect(result.scentProfile).toEqual({
      top: 'Bergamot',
      heart: 'Lavender',
      base: 'Cedarwood',
    })
    // First paragraph contains a colon, so no tagline is derived.
    expect(result.tagline).toBeUndefined()
  })

  it('falls back to regex extraction for burn time and vessel outside a details block', () => {
    const description = ['Beautiful glow for any room.', 'Burn time: 30 hours', 'Vessel: Tin'].join(
      '\n',
    )
    const result = parseEtsyDescription('Candle', description)
    expect(result.burnTime).toBe('30 hours')
    expect(result.vessel).toBe('Tin')
    expect(result.tagline).toBe('Beautiful glow for any room.')
  })

  it('skips the tagline when the first paragraph is long or bulleted', () => {
    const longPara = 'x'.repeat(200)
    expect(parseEtsyDescription('Candle', longPara).tagline).toBeUndefined()
    expect(parseEtsyDescription('Candle', '• Bullet first line').tagline).toBeUndefined()
  })

  it('returns empty specifications and no optional fields for unstructured text', () => {
    const result = parseEtsyDescription(
      'Candle',
      'Just a simple candle description: nothing structured here.',
    )
    expect(result.specifications).toEqual([])
    expect(result.scentProfile).toBeUndefined()
    expect(result.burnTime).toBeUndefined()
    expect(result.vessel).toBeUndefined()
  })
})
