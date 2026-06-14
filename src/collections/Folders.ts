import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

export const Folders: CollectionConfig = {
  slug: 'folders',
  folders: true,
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'name',
    group: 'System',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Folder Name',
    },
  ],
}
