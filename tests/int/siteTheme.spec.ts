import { describe, expect, it } from 'vite-plus/test'
import {
  DEFAULT_SITE_THEME_SETTINGS,
  normalizeSiteThemeSettings,
  SITE_THEME_OPTIONS,
} from '@/utilities/siteTheme'

describe('site theme settings', () => {
  it('returns approved defaults when no settings exist', () => {
    expect(normalizeSiteThemeSettings(null)).toEqual(DEFAULT_SITE_THEME_SETTINGS)
  })

  it('keeps valid admin-selected values', () => {
    expect(
      normalizeSiteThemeSettings({
        colorScheme: 'black-gold-rose',
        fontSet: 'playfair-inter',
        heroLayout: 'cinematic-noir',
        productCardDensity: 'gallery',
        sectionMood: 'noir-contrast',
        ctaStyle: 'couture-glow',
      }),
    ).toEqual({
      colorScheme: 'black-gold-rose',
      fontSet: 'playfair-inter',
      heroLayout: 'cinematic-noir',
      productCardDensity: 'gallery',
      sectionMood: 'noir-contrast',
      ctaStyle: 'couture-glow',
    })
  })

  it('falls back per-field when a stored value is unknown', () => {
    expect(
      normalizeSiteThemeSettings({
        colorScheme: 'unknown-skin',
        fontSet: 'bad-font',
        heroLayout: 'bad-layout',
        productCardDensity: 'bad-density',
        sectionMood: 'bad-mood',
        ctaStyle: 'bad-cta',
      }),
    ).toEqual(DEFAULT_SITE_THEME_SETTINGS)
  })

  it('keeps legacy skin values available for backward compatibility', () => {
    expect(SITE_THEME_OPTIONS.colorSchemes.map((option) => option.value)).toEqual(
      expect.arrayContaining(['ink-orchid', 'lavender-noir', 'porcelain-pop']),
    )
  })
})
