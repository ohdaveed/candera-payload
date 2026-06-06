import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

import { productRevalidateHooks } from '../utilities/revalidate'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

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
    defaultColumns: ['title', 'productType', 'etsyListingId', 'updatedAt'],
    group: 'Commerce',
  },
  hooks: {
    afterChange: [productRevalidateHooks.afterChange],
    afterDelete: [productRevalidateHooks.afterDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // For optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'productType',
              type: 'select',
              defaultValue: 'candle',
              options: [
                { label: 'Candle', value: 'candle' },
                { label: 'Vintage / Home', value: 'vintage' },
              ],
              required: true,
            },
            {
              name: 'tagline',
              type: 'text',
              admin: {
                description: 'Short poetic tagline shown on product cards.',
              },
            },
            {
              name: 'description',
              type: 'richText',
              admin: {
                description: 'The story and details of this piece.',
              },
            },
            {
              name: 'extraPhotos',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'atmosphere',
                  type: 'text',
                  admin: {
                    condition: (data) => data?.productType === 'candle',
                    description: 'Mood descriptor e.g. "Coastal & Airy".',
                  },
                },
                {
                  name: 'burnTime',
                  type: 'text',
                  admin: {
                    condition: (data) => data?.productType === 'candle',
                    description: 'Expected burn time e.g. "50 Hours".',
                  },
                },
              ],
            },
            {
              name: 'scentProfile',
              type: 'group',
              label: 'Scent Profile',
              admin: {
                condition: (data) => data?.productType === 'candle',
              },
              fields: [
                { name: 'top', type: 'text', label: 'Top Note' },
                { name: 'heart', type: 'text', label: 'Heart Note' },
                { name: 'base', type: 'text', label: 'Base Note' },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          name: 'meta',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'etsyListingId',
      type: 'number',
      required: true,
      unique: true,
      admin: {
        description: 'The numeric ID from Etsy (e.g. 123456789)',
        position: 'sidebar',
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
      name: 'productTag',
      type: 'select',
      options: ['Bestseller', 'New Release', 'Limited Batch'],
      admin: {
        description: 'Badge shown on product cards.',
        position: 'sidebar',
      },
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
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
