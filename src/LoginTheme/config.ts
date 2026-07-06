import type { GlobalConfig } from 'payload'

export const LoginTheme: GlobalConfig = {
  slug: 'login-theme',
  label: 'Login Theme',
  access: {
    read: () => true,
  },
  admin: {
    description:
      'Tracks which background color the admin login page is currently cycled to. Change it from the "Login Page Color" widget on the dashboard.',
  },
  fields: [
    {
      name: 'colorIndex',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
      max: 8,
      admin: {
        description:
          'Index into the fixed 9-color palette (0-8). Advanced via the dashboard "Next color" button — not meant to be edited here directly.',
      },
    },
  ],
}
