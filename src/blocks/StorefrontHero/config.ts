import type { Block } from 'payload'

export const StorefrontHero: Block = {
  slug: 'storefrontHero',
  interfaceName: 'StorefrontHeroBlock',
  labels: {
    plural: 'Storefront Heroes',
    singular: 'Storefront Hero',
  },
  fields: [
    {
      name: 'heroTag',
      type: 'text',
      defaultValue: 'Hand-Poured in the Studio',
      label: 'Eyebrow Tag',
    },
    {
      name: 'headline',
      type: 'text',
      defaultValue: 'An invitation to slow down.',
      label: 'Headline',
      required: true,
    },
    {
      name: 'subheading',
      type: 'text',
      defaultValue: 'Limited Release: Batch 014 now curing in the studio.',
      label: 'Subheading',
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Background Image',
    },
    {
      name: 'primaryCtaLabel',
      type: 'text',
      defaultValue: 'Explore the Collection',
      label: 'Primary CTA Label',
    },
    // Legacy fields — retained in the schema for data safety but hidden from the
    // admin UI; the current hero design does not render them.
    {
      name: 'primaryCtaUrl',
      type: 'text',
      defaultValue: '#collection',
      label: 'Primary CTA URL',
      admin: { hidden: true },
    },
    {
      name: 'secondaryCtaLabel',
      type: 'text',
      defaultValue: 'Take the Scent Quiz',
      label: 'Secondary CTA Label',
      admin: { hidden: true },
    },
    {
      name: 'secondaryCtaUrl',
      type: 'text',
      defaultValue: '#scent-quiz',
      label: 'Secondary CTA URL',
      admin: { hidden: true },
    },
    {
      name: 'showStatusCard',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show Ethos Card',
    },
    {
      name: 'ethosCardEyebrow',
      type: 'text',
      defaultValue: 'The Slow Pour',
      label: 'Ethos Card · Eyebrow',
      admin: {
        condition: (_, { showStatusCard } = {}) => Boolean(showStatusCard),
      },
    },
    {
      name: 'ethosCardBody',
      type: 'textarea',
      defaultValue: 'No factories. No white labeling. Just real pressed botanicals and slow light.',
      label: 'Ethos Card · Body',
      admin: {
        condition: (_, { showStatusCard } = {}) => Boolean(showStatusCard),
      },
    },
    {
      name: 'ethosCardFooterLabel',
      type: 'text',
      defaultValue: 'Exclusively on Etsy',
      label: 'Ethos Card · Footer Label',
      admin: {
        condition: (_, { showStatusCard } = {}) => Boolean(showStatusCard),
      },
    },
    {
      name: 'ethosCardLinkLabel',
      type: 'text',
      defaultValue: 'Read Journal',
      label: 'Ethos Card · Journal Link Label',
      admin: {
        description: 'Scrolls to the Journal section. The ↓ glyph is added automatically.',
        condition: (_, { showStatusCard } = {}) => Boolean(showStatusCard),
      },
    },
    {
      name: 'statusCardTitle',
      type: 'text',
      defaultValue: 'Featured Candle',
      label: 'Status Card Title (e.g. Featured Candle)',
      admin: { hidden: true },
    },
    {
      name: 'statusCardPrice',
      type: 'text',
      defaultValue: '$38',
      label: 'Status Card Price',
      admin: { hidden: true },
    },
    {
      name: 'statusCardSubtitle',
      type: 'text',
      defaultValue: 'Wild Lilac (8 oz)',
      label: 'Status Card Subtitle (e.g. Wild Lilac (8 oz))',
      admin: { hidden: true },
    },
    {
      name: 'statusCardStatus',
      type: 'text',
      defaultValue: 'Limited Batch',
      label: 'Status Card Left Label (e.g. Limited Batch)',
      admin: { hidden: true },
    },
    {
      name: 'statusCardShips',
      type: 'text',
      label: 'Status Card Left Value (e.g. 47 units total)',
      admin: { hidden: true },
    },
    {
      name: 'statusCardLinkUrl',
      type: 'text',
      defaultValue: '/products/wild-lilac',
      label: 'Status Card Link URL',
      admin: { hidden: true },
    },
  ],
}
