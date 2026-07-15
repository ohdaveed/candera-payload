import type { GlobalConfig } from 'payload'

import { revalidateStudioInfo } from './hooks/revalidateStudioInfo'
import { BRAND } from '@/constants/brand'
import { isAdmin } from '../access/isAdmin'

export const StudioInfo: GlobalConfig = {
  slug: 'studio-info',
  label: 'Studio Info',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: {
    description:
      'Editorial content surfaced across the storefront — contact details, Inner Circle benefits, and search suggestions.',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contact & Location',
          description: 'Shown on the Contact page.',
          fields: [
            {
              name: 'email',
              type: 'email',
              required: true,
              defaultValue: BRAND.email,
              admin: { description: 'Primary studio inbox (rendered as a mailto link).' },
            },
            {
              name: 'instagramHandle',
              type: 'text',
              required: true,
              defaultValue: BRAND.instagramHandle,
              admin: { description: 'Public-facing handle, e.g. "@canderacandles".' },
            },
            {
              name: 'instagramUrl',
              type: 'text',
              required: true,
              defaultValue: BRAND.instagramUrl,
              admin: { description: 'Full URL the Instagram handle links to.' },
            },
            {
              name: 'studioHours',
              type: 'text',
              required: true,
              defaultValue: BRAND.studioHours,
            },
            {
              name: 'locationTagline',
              type: 'text',
              required: true,
              defaultValue: BRAND.locationTagline,
            },
          ],
        },
        {
          label: 'Inner Circle',
          description: 'The "What you\'ll receive" benefit cards on the Inner Circle page.',
          fields: [
            {
              name: 'innerCircleBenefits',
              type: 'array',
              label: 'Benefits',
              labels: { singular: 'Benefit', plural: 'Benefits' },
              // No minRows: on existing deploys the seed endpoint doesn't run, so this
              // starts empty. The storefront falls back to FALLBACK_BENEFITS when empty,
              // and editors must still be able to save the global without recreating rows.
              maxRows: 6,
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'description', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          label: 'Search Configuration',
          description: 'Suggested scent terms shown on the empty/no-results search screen.',
          fields: [
            {
              name: 'searchSuggestions',
              type: 'array',
              label: 'Suggestions',
              labels: { singular: 'Suggestion', plural: 'Suggestions' },
              // No minRows — see innerCircleBenefits above; the storefront falls back to
              // FALLBACK_SUGGESTIONS when empty.
              maxRows: 12,
              fields: [{ name: 'term', type: 'text', required: true }],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateStudioInfo],
  },
}
