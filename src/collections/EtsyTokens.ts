import type { CollectionConfig } from 'payload'

export const EtsyTokens: CollectionConfig = {
  slug: 'etsy-tokens',
  admin: {
    useAsTitle: 'label',
    group: 'System',
    hidden: true,
    description:
      "OAuth tokens used to sync products from Etsy. Managed automatically by the connect/sync flow — don't edit directly.",
  },
  access: {
    create: () => false, // Only server-side
    read: () => false, // Only server-side
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      defaultValue: 'Etsy OAuth Token',
      admin: { hidden: true },
    },
    {
      name: 'accessToken',
      type: 'text',
      required: true,
    },
    {
      name: 'refreshToken',
      type: 'text',
      required: true,
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
    },
  ],
}
