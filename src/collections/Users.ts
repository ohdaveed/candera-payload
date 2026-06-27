import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { preventSuspendedLogin } from '../hooks/preventSuspendedLogin'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email', 'roles', 'status', 'updatedAt'],
    useAsTitle: 'name',
    group: 'System',
  },
  auth: true,
  hooks: {
    beforeLogin: [preventSuspendedLogin],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['editor'],
      saveToJWT: true,
      admin: {
        description: 'Internal access label for admin users.',
        isClearable: false,
        isSortable: true,
      },
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Editor',
          value: 'editor',
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      admin: {
        description: 'Suspended accounts are blocked from logging in.',
      },
      options: [
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Suspended',
          value: 'suspended',
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes for account context. Do not store secrets here.',
        position: 'sidebar',
        rows: 4,
      },
    },
  ],
  timestamps: true,
}
