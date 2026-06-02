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
      defaultValue: 'Take the Scent Quiz →',
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
      defaultValue: 'Batch 014',
      label: 'Status Card Title',
      admin: {
        condition: (_, { showStatusCard } = {}) => Boolean(showStatusCard),
      },
    },
    {
      name: 'statusCardSubtitle',
      type: 'text',
      defaultValue: '47 units · hand-poured',
      label: 'Status Card Subtitle',
      admin: {
        condition: (_, { showStatusCard } = {}) => Boolean(showStatusCard),
      },
    },
    {
      name: 'statusCardStatus',
      type: 'text',
      defaultValue: 'Curing',
      label: 'Status Card Status Label',
      admin: {
        condition: (_, { showStatusCard } = {}) => Boolean(showStatusCard),
      },
    },
    {
      name: 'statusCardShips',
      type: 'text',
      defaultValue: '~3 weeks',
      label: 'Status Card Ships Label',
      admin: {
        condition: (_, { showStatusCard } = {}) => Boolean(showStatusCard),
      },
    },
  ],
}
