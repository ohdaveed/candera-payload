/**
 * Canonical brand / contact details.
 *
 * The `StudioInfo` global is the live source of truth — editors can override
 * these in the admin. These constants are the single place for the hardcoded
 * fallbacks/defaults that were previously duplicated across components, the
 * schema.org markup, layout metadata, and the global's `defaultValue`s.
 */
export const BRAND = {
  email: 'studio@canderacandles.com',
  instagramHandle: '@canderacandles',
  instagramUrl: 'https://instagram.com/canderacandles',
  studioHours: 'By appointment — slow by design.',
  locationTagline: 'Handcrafted in California',
} as const
