import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { productRevalidateHooks } from '../utilities/revalidate'

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
    group: 'Commerce',
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
      name: 'tagline',
      type: 'text',
      admin: {
        description: 'Short poetic tagline shown on product cards.',
      },
    },
    {
      name: 'productTag',
      type: 'select',
      options: ['Bestseller', 'New Release', 'Limited Batch'],
      admin: {
        description: 'Badge shown on product cards.',
      },
    },
    {
      name: 'atmosphere',
      type: 'text',
      admin: {
        description: 'Mood descriptor e.g. "Coastal & Airy".',
      },
    },
    {
      name: 'burnTime',
      type: 'text',
      defaultValue: '50 Hours',
      admin: {
        description: 'Expected burn time e.g. "50 Hours".',
      },
    },
    {
      name: 'scentProfile',
      type: 'group',
      label: 'Scent Profile',
      fields: [
        { name: 'top', type: 'text', label: 'Top Note' },
        { name: 'heart', type: 'text', label: 'Heart Note' },
        { name: 'base', type: 'text', label: 'Base Note' },
      ],
    },
    {
      name: 'vessel',
      type: 'text',
      admin: {
        description: 'Vessel number e.g. "001".',
        position: 'sidebar',
      },
    },
    {
      name: 'price',
      type: 'number',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
  ],
  hooks: {
    afterChange: [productRevalidateHooks.afterChange],
    afterDelete: [productRevalidateHooks.afterDelete],
  },
}
