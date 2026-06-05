import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const Products: CollectionConfig = {
  slug: 'products',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'etsyListingId', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'etsyListingId',
      type: 'number',
      required: true,
      unique: true,
      admin: {
        description: 'The numeric ID from Etsy (e.g. 123456789)',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'richText',
      admin: {
        description: 'Extra content to show on your site beyond the Etsy description.',
      },
    },
    {
      name: 'extraPhotos',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
    {
      name: 'price',
      type: 'number',
      admin: { description: 'Display price in USD (e.g. 48)' },
    },
    {
      name: 'size',
      type: 'text',
      admin: { description: 'e.g. "15 oz"' },
    },
    {
      name: 'waxBlend',
      type: 'text',
      admin: { description: 'e.g. "Soy & beeswax blend"' },
    },
    {
      name: 'craftsmanship',
      type: 'text',
      admin: { description: 'e.g. "Numbered vessel · Micro-batch cured"' },
    },
    {
      name: 'origin',
      type: 'text',
      admin: { description: 'e.g. "Ships from California"' },
    },
    {
      name: 'fragranceNotes',
      type: 'group',
      fields: [
        { name: 'top', type: 'text' },
        { name: 'heart', type: 'text' },
        { name: 'base', type: 'text' },
      ],
    },
    {
      name: 'burnTime',
      type: 'text',
      admin: { description: 'e.g. "50 Hours"' },
    },
    {
      name: 'atmosphere',
      type: 'text',
      admin: { description: 'e.g. "Bold & Floral"' },
    },
  ],
}
