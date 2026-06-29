import { createSafeActionClient } from 'next-safe-action'

export const actionClient = createSafeActionClient({
  handleServerError(error: unknown) {
    console.error('Server Action Error:', error)
    return error instanceof Error ? error.message : 'An unexpected error occurred.'
  },
})
