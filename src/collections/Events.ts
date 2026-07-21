import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { authenticated } from '../access/authenticated'
import { authenticatedOrPublished } from '../access/authenticatedOrPublished'
import { generatePreviewPath } from '../utilities/generatePreviewPath'
import { eventsRevalidateHooks } from '../utilities/revalidate'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Events: CollectionConfig<'events'> = {
  slug: 'events',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultPopulate: {
    venueName: true,
    slug: true,
    eventDate: true,
    eventEndDate: true,
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    useAsTitle: 'venueName',
    defaultColumns: ['venueName', 'eventDate', 'city', '_status', 'updatedAt'],
    group: 'Content',
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'events',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'events',
        req,
      }),
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'venueName',
              type: 'text',
              required: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'eventDate',
                  type: 'date',
                  required: true,
                  admin: {
                    date: {
                      pickerAppearance: 'dayOnly',
                    },
                    description: 'Start date.',
                  },
                },
                {
                  name: 'eventEndDate',
                  type: 'date',
                  admin: {
                    date: {
                      pickerAppearance: 'dayOnly',
                    },
                    description: 'Only set for multi-day events.',
                  },
                },
              ],
            },
            {
              name: 'timeRange',
              type: 'text',
              required: true,
              admin: {
                description: 'e.g. "12PM – 5PM"',
              },
            },
            {
              type: 'row',
              fields: [
                { name: 'address', type: 'text', required: true },
                { name: 'city', type: 'text', required: true },
              ],
            },
            {
              name: 'mapUrl',
              type: 'text',
              admin: {
                description: 'Google Maps link, optional.',
              },
            },
            {
              name: 'blurb',
              type: 'textarea',
              required: true,
            },
          ],
        },
        {
          name: 'meta',
          label: 'SEO',
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
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    slugField(),
  ],
  hooks: {
    afterChange: [eventsRevalidateHooks.afterChange],
    afterDelete: [eventsRevalidateHooks.afterDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 2000,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
