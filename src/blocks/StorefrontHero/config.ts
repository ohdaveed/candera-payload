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
    {
      name: 'primaryCtaUrl',
      type: 'text',
      defaultValue: '#collection',
      label: 'Primary CTA URL',
    },
    {
      name: 'secondaryCtaLabel',
      type: 'text',
      defaultValue: 'Take the Scent Quiz',
      label: 'Secondary CTA Label',
    },
    {
      name: 'secondaryCtaUrl',
      type: 'text',
      defaultValue: '#scent-quiz',
      label: 'Secondary CTA URL',
    },
    {
      name: 'showStatusCard',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show Status Card',
    },
    {
      name: 'statusCardTitle',
      type: 'text',
      defaultValue: 'Featured Candle',
      label: 'Status Card Title (e.g. Featured Candle)',
      admin: {
        condition: (_, { showStatusCard } = {}) => Boolean(showStatusCard),
      },
    },
    {
      name: 'statusCardPrice',
      type: 'text',
      defaultValue: '$38',
      label: 'Status Card Price',
      admin: {
        condition: (_, { showStatusCard } = {}) => Boolean(showStatusCard),
      },
    },
    {
      name: 'statusCardSubtitle',
      type: 'text',
      defaultValue: 'Wild Lilac (8 oz)',
      label: 'Status Card Subtitle (e.g. Wild Lilac (8 oz))',
      admin: {
        condition: (_, { showStatusCard } = {}) => Boolean(showStatusCard),
      },
    },
    {
      name: 'statusCardStatus',
      type: 'text',
      defaultValue: 'Limited Batch',
      label: 'Status Card Left Label (e.g. Limited Batch)',
      admin: {
        condition: (_, { showStatusCard } = {}) => Boolean(showStatusCard),
      },
    },
    {
      name: 'statusCardShips',
      type: 'text',
      defaultValue: '47 units total',
      label: 'Status Card Left Value (e.g. 47 units total)',
      admin: {
        condition: (_, { showStatusCard } = {}) => Boolean(showStatusCard),
      },
    },
    {
      name: 'statusCardLinkUrl',
      type: 'text',
      defaultValue: '/products/wild-lilac',
      label: 'Status Card Link URL',
      admin: {
        condition: (_, { showStatusCard } = {}) => Boolean(showStatusCard),
      },
    },
  ],
}
