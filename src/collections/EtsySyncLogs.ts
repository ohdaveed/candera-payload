import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

export const EtsySyncLogs: CollectionConfig = {
  slug: 'etsy-sync-logs',
  admin: {
    useAsTitle: 'createdAt',
    defaultColumns: ['trigger', 'success', 'count', 'failureCount', 'createdAt'],
    group: 'System',
    description:
      'History of Etsy sync runs, however triggered. Written automatically — not editable.',
  },
  access: {
    create: () => false,
    read: isAdmin,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'trigger',
      type: 'select',
      required: true,
      options: [
        { label: 'Dashboard', value: 'dashboard' },
        { label: 'CLI', value: 'cli' },
      ],
      admin: {
        description: 'How this sync run was started.',
      },
    },
    {
      name: 'triggeredBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Admin user who clicked Sync in the dashboard. Empty for CLI-triggered runs.',
      },
    },
    {
      name: 'success',
      type: 'checkbox',
      required: true,
      defaultValue: false,
    },
    {
      name: 'count',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Listings synced during this run.',
      },
    },
    {
      name: 'failureCount',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Number of per-listing failures during this run.',
      },
    },
    {
      name: 'failures',
      type: 'array',
      fields: [
        { name: 'listingId', type: 'number', required: true },
        { name: 'error', type: 'text', required: true },
      ],
      admin: {
        description: 'Per-listing failures for this run, if any.',
      },
    },
    {
      name: 'fatalError',
      type: 'text',
      admin: {
        description:
          'Set only when the whole run threw before completing (e.g. an Etsy auth failure) — distinct from the per-listing failures above.',
      },
    },
  ],
  timestamps: true,
}
