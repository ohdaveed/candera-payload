import type { SiteThemeSettings } from '@/utilities/siteTheme'

export type ThemePreset = {
  id: string
  name: string
  description: string
  swatchColors: [string, string, string]
  settings: Omit<SiteThemeSettings, 'productCardDensity'>
}

/*
 * NOTE TO FUTURE CONTRIBUTORS:
 * Presets have been updated to use the canonical brand font sets ('default' for Fraunces/EB Garamond and 'dm-sans' for DM Sans).
 * Non-brand font choices (playfair-inter, space-grotesk) have been removed.
 */
export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'warm-botanical',
    name: 'Warm Botanical',
    description: 'Fraunces · Light editorial · Conversion CTA',
    swatchColors: ['#fdfbf7', '#b28c9c', '#dd7d52'],
    settings: {
      colorScheme: 'rose-conversion',
      fontSet: 'default',
      heroLayout: 'centered-editorial',
      sectionMood: 'light-editorial',
      ctaStyle: 'conversion-filled',
    },
  },
  {
    id: 'ink-orchid',
    name: 'Ink & Orchid',
    description: 'Fraunces · Noir contrast · Couture glow',
    swatchColors: ['#0d0b10', '#ef5da8', '#ff8a65'],
    settings: {
      colorScheme: 'ink-orchid-coral',
      fontSet: 'default',
      heroLayout: 'cinematic-noir',
      sectionMood: 'noir-contrast',
      ctaStyle: 'couture-glow',
    },
  },
  {
    id: 'lavender-noir',
    name: 'Lavender Noir',
    description: 'DM Sans · Rose wash · Conversion CTA',
    swatchColors: ['#f8f4ff', '#9b7fd4', '#e8748a'],
    settings: {
      colorScheme: 'lavender-trust-rose',
      fontSet: 'dm-sans',
      heroLayout: 'split-atelier',
      sectionMood: 'rose-wash',
      ctaStyle: 'conversion-filled',
    },
  },
  {
    id: 'dark-luxe',
    name: 'Dark Luxe',
    description: 'Fraunces · Noir contrast · Couture glow',
    swatchColors: ['#0d0d0c', '#c4956a', '#e8748a'],
    settings: {
      colorScheme: 'black-gold-rose',
      fontSet: 'default',
      heroLayout: 'cinematic-noir',
      sectionMood: 'noir-contrast',
      ctaStyle: 'couture-glow',
    },
  },
]
