import type { GlobalConfig } from 'payload'

import { revalidateSiteTheme } from './hooks/revalidateSiteTheme'

export const SiteTheme: GlobalConfig = {
  slug: 'site-theme',
  label: 'Site Theme',
  access: {
    read: () => true,
  },
  admin: {
    description:
      'Pick the storefront color direction and font pairing. All palettes are WCAG AA verified.',
  },
  fields: [
    {
      name: 'colorScheme',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: 'Default (current design)', value: 'default' },
        { label: 'Ink & Orchid — near-black with orchid pink', value: 'ink-orchid' },
        { label: 'Lavender Noir — aubergine with luminous lavender', value: 'lavender-noir' },
        { label: 'Porcelain Pop — white with magenta & violet', value: 'porcelain-pop' },
      ],
      required: true,
    },
    {
      name: 'fontSet',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: 'Default (current fonts)', value: 'default' },
        { label: 'Playfair Display + Inter (serif headlines)', value: 'playfair-inter' },
        { label: 'DM Sans (friendly geometric sans)', value: 'dm-sans' },
        { label: 'Space Grotesk (modern studio sans)', value: 'space-grotesk' },
      ],
      required: true,
    },
  ],
  hooks: {
    afterChange: [revalidateSiteTheme],
  },
}
