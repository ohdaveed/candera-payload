import type { CollectionConfig } from 'payload'
import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const ScentProfiles: CollectionConfig = {
  slug: 'scent-profiles',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
    group: 'Quiz',
    description:
      'Scent profiles used to score and recommend products from Scent Quiz results. No page of its own.',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Used for internal identification and URL linking.',
      },
    },
    {
      name: 'tagline',
      type: 'text',
      required: true,
    },
    {
      name: 'notes',
      type: 'text',
      admin: {
        description: 'e.g. "Sea Breeze · Driftwood · Salt Air"',
      },
    },
    {
      name: 'editorial',
      type: 'textarea',
      required: true,
    },
    {
      name: 'featuredProduct',
      type: 'relationship',
      relationTo: 'products',
      admin: {
        description: 'The product recommended for this atmosphere.',
      },
    },
    {
      name: 'ambientImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Background image shown during the quiz or result reveal.',
      },
    },
  ],
}
