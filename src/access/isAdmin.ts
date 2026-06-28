import type { AccessArgs } from 'payload'

import type { User } from '@/payload-types'

type isAdmin = (args: AccessArgs<User>) => boolean

/**
 * Grants access only to authenticated users carrying the `admin` role.
 * Mirrors `authenticated`, but additionally checks the `roles` field
 * (a `hasMany` select saved to the JWT — see `collections/Users`).
 */
export const isAdmin: isAdmin = ({ req: { user } }) => {
  return Boolean(user && 'roles' in user && user.roles?.includes('admin'))
}

/** Plain predicate for use outside of Payload access functions (route handlers). */
export const userIsAdmin = (user: unknown): boolean => {
  return Boolean(
    user &&
      typeof user === 'object' &&
      'roles' in user &&
      (user as { roles?: string[] }).roles?.includes('admin'),
  )
}
