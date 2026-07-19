import type { ParsedEtsyDescription } from './types'

// Matches shipping/packaging contexts whose dimensions are logistics noise, not
// customer-facing product specs (the raw text is still kept in rawEtsyDescription).
// Anchored to boundaries that treat `-` as part of a word, so labels that merely
// contain these substrings (e.g. "Boxwood", "Parcel-gilt finish") are not dropped.
const SHIPPING_CONTEXT_RE = /(?<![\w-])(?:box|shipping|package|parcel|postage)(?![\w-])/i

/**
 * Unescapes common HTML entities.
 */
export function unescapeHtml(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
  }
  return text.replace(/&[#\w]+;/g, (match) => entities[match] || match)
}

/**
 * Derives a clean, editor-facing product name from Etsy's keyword-stuffed
 * title. Etsy sellers cram SEO terms after a delimiter ("Anya's Eyes Candle |
 * Hand Poured | Gift for Her"); the product name is the first segment. We take
 * everything before the first delimiter and cap the length so the result is a
 * sensible default — editors refine it in admin, and re-syncs won't overwrite
 * their edit (title is create-only).
 */
export function deriveCleanTitle(rawTitle: string): string {
  const unescaped = unescapeHtml(rawTitle).trim()
  // Split on common Etsy separators: pipe, en/em dash, colon, " - ", ", ".
  const firstSegment = unescaped.split(/\s*[|–—:]\s*| - |,\s+/)[0] ?? unescaped
  const cleaned = firstSegment.replace(/\s+/g, ' ').trim()

  if (!cleaned) return unescaped
  // A first segment with no delimiters can still be a long keyword run; keep
  // it readable by falling back to the leading words.
  if (cleaned.length <= 60) return cleaned
  return cleaned.split(' ').slice(0, 8).join(' ')
}

/**
 * Slugifies a string identically to Payload's built-in `slugify` (the one the
 * collection's slugField hook uses). Kept in lockstep so the slug we compute
 * for the collision pre-check matches the value the hook stores on create —
 * any drift would make the uniqueness check miss and reintroduce collisions.
 * Source: payload/dist/utilities/slugify.js.
 */
export function slugify(val: string): string {
  return (
    val
      ?.trim()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '')
      .toLowerCase() ?? ''
  )
}

/**
 * Cleans up raw Etsy listing descriptions by removing promotional fluff,
 * unescaping HTML entities, and stripping external shop links.
 */
export function cleanEtsyDescription(text: string): string {
  if (!text) return ''

  let cleaned = unescapeHtml(text)

  // Remove dash separators
  cleaned = cleaned.replace(/-{3,}/g, '')

  // Remove common Etsy-specific promotional phrases
  const promoPhrases = [
    /Please visit my store for more fantastic items to buy!/gi,
    /Click the heart in the Favorite Shop box at the top of this page/gi,
    /Thank you for visiting and purchase!/gi,
    /Visit my shop at: https:\/\/www\.etsy\.com\/ca\/shop\/[a-z0-9-]+/gi,
    /https:\/\/www\.etsy\.com\/ca\/shop\/[a-z0-9-]+/gi,
  ]

  promoPhrases.forEach((phrase) => {
    cleaned = cleaned.replace(phrase, '')
  })

  // Trim whitespace and double newlines
  return cleaned.trim().replace(/\n{3,}/g, '\n\n')
}

/**
 * Parses specifications, scentProfile, tagline, and burnTime from raw Etsy description
 * and listing properties.
 */
export function parseEtsyDescription(_title: string, description: string): ParsedEtsyDescription {
  const specifications: Array<{ label: string; value: string }> = []
  let top: string | undefined = undefined
  let heart: string | undefined = undefined
  let base: string | undefined = undefined
  let burnTime: string | undefined = undefined
  let vessel: string | undefined = undefined
  let tagline: string | undefined = undefined

  // Extract tagline from first paragraph
  const paragraphs = description
    .split('\n')
    .map((p) => p.trim())
    .filter((p) => p.length > 0)

  if (paragraphs.length > 0) {
    const firstPara = paragraphs[0]
    if (
      firstPara.length < 180 &&
      !firstPara.includes(':') &&
      !firstPara.startsWith('•') &&
      !firstPara.startsWith('-')
    ) {
      tagline = firstPara
    }
  }

  let inDetailsBlock = false
  let inScentBlock = false
  let lastHeading = ''

  const lines = description.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const lowerTrimmed = trimmed.toLowerCase()

    const isBullet = /^\s*[•*\-+]\s*/.test(trimmed)

    // Detect block headers
    if (
      !isBullet &&
      (lowerTrimmed.includes('product details') ||
        lowerTrimmed.includes('item details') ||
        lowerTrimmed.includes('specifications') ||
        lowerTrimmed.includes('dimensions'))
    ) {
      inDetailsBlock = true
      inScentBlock = false
      continue
    }

    if (
      !isBullet &&
      (lowerTrimmed.includes('scent profile') ||
        lowerTrimmed.includes('fragrance profile') ||
        lowerTrimmed.includes('scent notes') ||
        lowerTrimmed.includes('fragrance notes'))
    ) {
      inScentBlock = true
      inDetailsBlock = false
      continue
    }

    if (
      !isBullet &&
      (lowerTrimmed.includes("what's included") ||
        lowerTrimmed.includes('important notes') ||
        lowerTrimmed.includes('shipping') ||
        lowerTrimmed.includes('returns'))
    ) {
      inDetailsBlock = false
      inScentBlock = false
      continue
    }

    // Parse details block
    if (inDetailsBlock) {
      const colonMatch = trimmed.match(/^(?:[•*\-+]\s*)?([^:]+):\s*(.*)$/)
      if (colonMatch && colonMatch[2].trim()) {
        const label = colonMatch[1].trim()
        const value = colonMatch[2].trim()
        const lowerLabel = label.toLowerCase()

        if (lowerLabel.includes('burn time')) {
          burnTime = value
        } else if (lowerLabel === 'vessel') {
          vessel = value
        } else {
          const isDimension =
            lowerLabel === 'length' || lowerLabel === 'width' || lowerLabel === 'height'

          // Drop shipping/box logistics from customer specs — either a label
          // that names a shipping context ("Weight with box") or a dimension
          // nested under one ("Box dimensions:" → Length/Width/Height).
          if (
            SHIPPING_CONTEXT_RE.test(label) ||
            (isDimension && SHIPPING_CONTEXT_RE.test(lastHeading))
          ) {
            continue
          }

          let finalLabel = label
          if (lastHeading && isDimension) {
            finalLabel = `${lastHeading} ${label}`
          }
          specifications.push({ label: finalLabel, value })
        }
      } else {
        if (trimmed.endsWith(':')) {
          lastHeading = trimmed
            .substring(0, trimmed.length - 1)
            .replace(/^[•*\-+]\s*/, '')
            .trim()
        } else {
          lastHeading = ''
        }
      }
    }

    // Parse scent block
    if (inScentBlock) {
      const colonMatch = trimmed.match(/^(?:[•*\-+]\s*)?([^:]+):\s*(.+)$/)
      if (colonMatch) {
        const label = colonMatch[1].trim().toLowerCase()
        const value = colonMatch[2].trim()
        if (value) {
          if (label.includes('top')) {
            top = value
          } else if (
            label.includes('heart') ||
            label.includes('middle') ||
            label.includes('heart note')
          ) {
            heart = value
          } else if (label.includes('base')) {
            base = value
          }
        }
      } else {
        const commaMatch = trimmed.match(/^(?:[•*\-+]\s*)?([^,]+),\s*([^,]+),\s*([^,]+)$/)
        if (commaMatch) {
          top = commaMatch[1].trim()
          heart = commaMatch[2].trim()
          base = commaMatch[3].trim()
        }
      }
    }
  }

  // Fallbacks
  if (!burnTime) {
    const burnMatch = description.match(/burn\s*time:\s*([^•\n]+)/i)
    if (burnMatch) burnTime = burnMatch[1].trim()
  }
  if (!vessel) {
    const vesselMatch = description.match(/vessel:\s*([^•\n]+)/i)
    if (vesselMatch) vessel = vesselMatch[1].trim()
  }

  const result: ParsedEtsyDescription = { specifications }
  if (top || heart || base) {
    result.scentProfile = { top, heart, base }
  }
  if (burnTime) result.burnTime = burnTime
  if (vessel) result.vessel = vessel
  if (tagline) result.tagline = tagline

  return result
}
