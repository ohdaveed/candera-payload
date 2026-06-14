import type { CollectionBeforeLoginHook } from 'payload'

export const preventSuspendedLogin: CollectionBeforeLoginHook = ({ user }) => {
  if (user.status === 'suspended') {
    throw new Error('Your account has been suspended. Contact an administrator.')
  }
  return user
}
