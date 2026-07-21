import type { GlobalConfig } from 'payload'

import { revalidateSiteTheme } from './hooks/revalidateSiteTheme'
import { isAdmin } from '../access/isAdmin'

export const SiteTheme: GlobalConfig = {
  slug: 'site-theme',
  label: 'Site Theme',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: {
    description:
      'Pick the storefront color direction and font pairing. All palettes are WCAG AA verified.',
  },
  fields: [
    {
      name: 'colorScheme',
      type: 'select',
      defaultValue: 'rose-conversion',
      options: [
        {
          label: 'Rose Conversion — warm editorial, conversion-optimised',
          value: 'rose-conversion',
        },
        { label: 'Black Gold Rose — luxury near-black with gold & rose', value: 'black-gold-rose' },
        { label: 'Amethyst Amber — purples & amber warmth', value: 'amethyst-amber' },
        { label: 'Ink Orchid Coral — near-black with orchid & coral', value: 'ink-orchid-coral' },
        { label: 'Plum Sage Coral — warm plum, sage & coral', value: 'plum-sage-coral' },
        {
          label: 'Lavender Trust Rose — trustworthy lavender with dusky rose',
          value: 'lavender-trust-rose',
        },
        { label: 'Legacy: Ink & Orchid', value: 'ink-orchid' },
        { label: 'Legacy: Lavender Noir', value: 'lavender-noir' },
        { label: 'Legacy: Porcelain Pop', value: 'porcelain-pop' },
        { label: 'Legacy: Default', value: 'default' },
        {
          label: 'Botanical Lavender — cream & plum with a lavender accent',
          value: 'botanical-lavender',
        },
      ],
      required: true,
    },
    {
      name: 'fontSet',
      type: 'select',
      defaultValue: 'default',
      /*
       * NOTE TO FUTURE CONTRIBUTORS:
       * The approved brand font system consists strictly of:
       * - Fraunces (display/editorial headings)
       * - DM Sans (body and secondary sans-serif)
       * - EB Garamond (editorial/text body)
       * Options like space-grotesk and playfair-inter have been removed to prevent off-brand styling
       * and avoid extra font loading payloads. Do not re-add them without brand design approval.
       */
      options: [
        { label: 'Default (current fonts)', value: 'default' },
        { label: 'DM Sans (friendly geometric sans)', value: 'dm-sans' },
      ],
      required: true,
    },
    {
      name: 'heroLayout',
      type: 'select',
      defaultValue: 'centered-editorial',
      options: [
        { label: 'Centered Editorial', value: 'centered-editorial' },
        { label: 'Split Atelier', value: 'split-atelier' },
        { label: 'Cinematic Noir', value: 'cinematic-noir' },
      ],
      admin: {
        description: 'Controls the hero section layout on the homepage',
      },
    },
    {
      name: 'productCardDensity',
      type: 'select',
      defaultValue: 'boutique-grid',
      options: [
        { label: 'Gallery', value: 'gallery' },
        { label: 'Boutique Grid', value: 'boutique-grid' },
        { label: 'Compact', value: 'compact' },
      ],
      admin: {
        description: 'Controls how products are displayed in archive grids',
      },
    },
    {
      name: 'sectionMood',
      type: 'select',
      defaultValue: 'light-editorial',
      options: [
        { label: 'Light Editorial', value: 'light-editorial' },
        { label: 'Rose Wash', value: 'rose-wash' },
        { label: 'Noir Contrast', value: 'noir-contrast' },
      ],
      admin: {
        description: 'Default section background mood',
      },
    },
    {
      name: 'ctaStyle',
      type: 'select',
      defaultValue: 'conversion-filled',
      options: [
        { label: 'Minimal Outline', value: 'minimal-outline' },
        { label: 'Conversion Filled', value: 'conversion-filled' },
        { label: 'Couture Glow', value: 'couture-glow' },
      ],
      admin: {
        description: 'Default call-to-action button style',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateSiteTheme],
  },
}
