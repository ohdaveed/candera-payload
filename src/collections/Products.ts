import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { authenticatedOrPublished } from '../access/authenticatedOrPublished'

import { productRevalidateHooks } from '../utilities/revalidate'
import { PRODUCT_TAGS } from '../lib/productTags'

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
    read: authenticatedOrPublished,
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
                { label: 'Custom Decor', value: 'custom' },
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
              name: 'isCustomizable',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Whether this product requires custom text input.',
              },
            },
            {
              name: 'customizationLabel',
              type: 'text',
              admin: {
                condition: (data) => data?.isCustomizable,
                description: 'Label for the customization field (e.g. "Family Name").',
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
              name: 'specifications',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', required: true },
                    { name: 'value', type: 'text', required: true },
                  ],
                },
              ],
              admin: {
                description: 'Product specifications shown in the details tab.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'atmosphere',
                  type: 'relationship',
                  relationTo: 'scent-profiles',
                  admin: {
                    condition: (data) => data?.productType === 'candle',
                    description: 'The ritual atmosphere associated with this candle.',
                  },
                },
                {
                  name: 'burnTime',
                  type: 'text',
                  label: 'Intention (Burn Time)',
                  defaultValue: '60 Hours',
                  admin: {
                    condition: (data) => data?.productType === 'candle',
                    description: 'The duration of the ritual, e.g. "60 Hours of Intention".',
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
            {
              name: 'generateCopy',
              type: 'ui' as const,
              admin: {
                components: {
                  Field: '@/components/admin/GenerateCopyButton#GenerateCopyButton',
                },
              },
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
      options: [...PRODUCT_TAGS],
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
      name: 'currency',
      type: 'select',
      defaultValue: 'USD',
      options: [
        { label: 'USD', value: 'USD' },
        { label: 'CAD', value: 'CAD' },
        { label: 'EUR', value: 'EUR' },
        { label: 'GBP', value: 'GBP' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Currency for the price above.',
      },
    },
    {
      name: 'priceSyncedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'When price was last synced from Etsy.',
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
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
