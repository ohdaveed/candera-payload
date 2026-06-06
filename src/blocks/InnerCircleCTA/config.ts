import type { Block } from 'payload'

export const InnerCircleCTA: Block = {
  slug: 'innerCircleCTA',
  interfaceName: 'InnerCircleCTABlock',
  labels: {
    plural: 'Inner Circle CTAs',
    singular: 'Inner Circle CTA',
  },
  fields: [
    {
      name: 'headline',
      type: 'text',
      defaultValue: 'Join the Inner Circle',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      defaultValue:
        'Our batches often sell out in days. Join our list to receive early access to new scent drops and personal ritual invitations.',
    },
    {
      name: 'ctaLabel',
      type: 'text',
      defaultValue: 'Request Entry',
    },
    {
      name: 'ctaUrl',
      type: 'text',
      defaultValue: '/inner-circle',
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      label: 'Editorial Photo',
    },
  ],
}
