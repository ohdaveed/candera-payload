import type { GlobalConfig } from 'payload'

import { revalidateStudioInfo } from './hooks/revalidateStudioInfo'

export const StudioInfo: GlobalConfig = {
  slug: 'studio-info',
  label: 'Studio Info',
  access: {
    read: () => true,
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
              type: 'text',
              required: true,
              defaultValue: 'studio@canderacandles.com',
              admin: { description: 'Primary studio inbox (rendered as a mailto link).' },
            },
            {
              name: 'instagramHandle',
              type: 'text',
              required: true,
              defaultValue: '@canderacandles',
              admin: { description: 'Public-facing handle, e.g. "@canderacandles".' },
            },
            {
              name: 'instagramUrl',
              type: 'text',
              required: true,
              defaultValue: 'https://instagram.com/canderacandles',
              admin: { description: 'Full URL the Instagram handle links to.' },
            },
            {
              name: 'studioHours',
              type: 'text',
              required: true,
              defaultValue: 'By appointment — slow by design.',
            },
            {
              name: 'locationTagline',
              type: 'text',
              required: true,
              defaultValue: 'Handcrafted in California',
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
              minRows: 1,
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
              minRows: 1,
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
