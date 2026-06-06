import type { Block } from 'payload'

export const Testimonials: Block = {
  slug: 'testimonials',
  interfaceName: 'TestimonialsBlock',
  labels: {
    plural: 'Testimonials',
    singular: 'Testimonials',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      defaultValue: 'Voices of the Inner Circle',
      label: 'Eyebrow Label',
    },
    {
      name: 'items',
      type: 'array',
      label: 'Testimonials',
      minRows: 1,
      fields: [
        { name: 'quote', type: 'textarea', required: true },
        { name: 'author', type: 'text', required: true },
        { name: 'location', type: 'text' },
        { name: 'badge', type: 'text', defaultValue: 'Verified Ritualist' },
      ],
    },
  ],
}
