import type { Block } from 'payload'

export const TheVessels: Block = {
  slug: 'theVessels',
  interfaceName: 'TheVesselsBlock',
  labels: {
    plural: 'The Vessels Showcases',
    singular: 'The Vessels Showcase',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Eyebrow Label',
    },
    {
      name: 'heading',
      type: 'text',
      label: 'Heading',
      admin: {
        description: 'Optional short heading shown above the showcase.',
      },
    },
    {
      name: 'items',
      type: 'array',
      label: 'Vessels',
      minRows: 3,
      maxRows: 3,
      admin: {
        description: 'A hyper-minimalist, three-column photography showcase.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'label',
          type: 'text',
          label: 'Label',
          admin: {
            description: 'e.g. "Vessel 001" or the vessel name.',
          },
        },
        {
          name: 'caption',
          type: 'text',
          label: 'Caption',
          admin: {
            description: 'Optional material / texture note.',
          },
        },
      ],
    },
  ],
}
