import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

export const Briefs: CollectionConfig = {
  slug: 'briefs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'updatedAt'],
    group: 'Marketing',
    description:
      'Internal SEO briefs drafted before writing product copy. Not published or visible on the live site — a drafting aid only.',
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  versions: true,
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'code',
      admin: {
        language: 'markdown',
      },
      required: true,
    },
  ],
}
