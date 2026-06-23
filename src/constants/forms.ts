/**
 * Canonical Payload `forms` collection titles.
 * Keep in sync with the seed definitions in src/endpoints/seed/*-form.ts —
 * these are the lookup keys used by getCachedFormByTitle().
 */
export const FORM_TITLES = {
  INNER_CIRCLE: 'Inner Circle Signup',
  CONTACT: 'Contact Form',
  SCENT_QUIZ: 'Scent Quiz',
} as const
