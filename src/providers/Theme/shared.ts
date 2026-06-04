import type { Theme } from './types'

export const themeLocalStorageKey = 'payload-theme'

export const defaultTheme = 'light'

/**
 * Reads the OS-level color scheme preference via the prefers-color-scheme media query.
 * Returns 'dark' or 'light', or null if the preference cannot be determined.
 */
export const getImplicitPreference = (): Theme | null => {
  const mediaQuery = '(prefers-color-scheme: dark)'
  const mql = window.matchMedia(mediaQuery)
  const hasImplicitPreference = typeof mql.matches === 'boolean'

  if (hasImplicitPreference) {
    return mql.matches ? 'dark' : 'light'
  }

  return null
}
