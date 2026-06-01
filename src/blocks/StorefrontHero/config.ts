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
  ],
}
