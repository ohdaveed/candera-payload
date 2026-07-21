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
    description:
      "Payload's built-in tool for organizing documents inside the admin panel. Doesn't affect the live site.",
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
