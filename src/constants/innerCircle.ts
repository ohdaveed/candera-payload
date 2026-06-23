/**
 * Default "What you'll receive" benefit cards.
 *
 * Single source of truth for both the storefront fallback (Inner Circle page,
 * shown when the StudioInfo global has no benefits) and the seeded StudioInfo
 * values — previously these had drifted apart.
 */
export const DEFAULT_INNER_CIRCLE_BENEFITS = [
  {
    label: 'Early Access',
    description: 'Shop every new batch a full 24 hours before it opens to the public.',
  },
  {
    label: 'Ritual Invitations',
    description: 'Reserve your spot at members-only studio events and seasonal workshops.',
  },
  {
    label: 'Studio Notes',
    description: 'Get a first look at new scents in development, straight from the curing room.',
  },
]

/** Canonical newsletter trust microcopy (was inconsistently "No spam" / "No noise"). */
export const NEWSLETTER_MICROCOPY = 'No spam · Unsubscribe any time'
