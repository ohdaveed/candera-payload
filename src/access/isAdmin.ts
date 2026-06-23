import type { AccessArgs } from 'payload'

import type { User } from '@/payload-types'

type isAdmin = (args: AccessArgs<User>) => boolean

/**
 * Grants access only to authenticated users carrying the `admin` role.
 * Mirrors `authenticated`, but additionally checks the `roles` field
 * (a `hasMany` select saved to the JWT — see `collections/Users`).
 */
export const isAdmin: isAdmin = ({ req: { user } }) => {
  return Boolean(user?.roles?.includes('admin'))
}

/** Plain predicate for use outside of Payload access functions (route handlers). */
export const userIsAdmin = (user: Pick<User, 'roles'> | null | undefined): boolean => {
  return Boolean(user?.roles?.includes('admin'))
}
