import type { CollectionConfig } from 'payload'

export const Folders: CollectionConfig = {
  slug: 'folders',
  folders: true,
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
