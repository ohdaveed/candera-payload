export const SITE_THEME_OPTIONS = {
  colorSchemes: [
    { label: 'Rose Conversion', value: 'rose-conversion' },
    { label: 'Black Gold Rose', value: 'black-gold-rose' },
    { label: 'Amethyst Amber', value: 'amethyst-amber' },
    { label: 'Ink Orchid Coral', value: 'ink-orchid-coral' },
    { label: 'Plum Sage Coral', value: 'plum-sage-coral' },
    { label: 'Lavender Trust Rose', value: 'lavender-trust-rose' },
    { label: 'Legacy: Ink & Orchid', value: 'ink-orchid' },
    { label: 'Legacy: Lavender Noir', value: 'lavender-noir' },
    { label: 'Legacy: Porcelain Pop', value: 'porcelain-pop' },
    { label: 'Legacy: Default', value: 'default' },
  ],
  /*
   * NOTE TO FUTURE CONTRIBUTORS:
   * The approved brand font system consists strictly of:
   * - Fraunces (display/editorial headings)
   * - DM Sans (body and secondary sans-serif)
   * - EB Garamond (editorial/text body)
   * Options like space-grotesk and playfair-inter have been removed to prevent off-brand styling
   * and avoid extra font loading payloads. Do not re-add them without brand design approval.
   */
  fontSets: [
    { label: 'Default (current fonts)', value: 'default' },
    { label: 'DM Sans (friendly geometric sans)', value: 'dm-sans' },
  ],
  heroLayouts: [
    { label: 'Centered Editorial', value: 'centered-editorial' },
    { label: 'Split Atelier', value: 'split-atelier' },
    { label: 'Cinematic Noir', value: 'cinematic-noir' },
  ],
  productCardDensities: [
    { label: 'Gallery', value: 'gallery' },
    { label: 'Boutique Grid', value: 'boutique-grid' },
    { label: 'Compact', value: 'compact' },
  ],
  sectionMoods: [
    { label: 'Light Editorial', value: 'light-editorial' },
    { label: 'Rose Wash', value: 'rose-wash' },
    { label: 'Noir Contrast', value: 'noir-contrast' },
  ],
  ctaStyles: [
    { label: 'Minimal Outline', value: 'minimal-outline' },
    { label: 'Conversion Filled', value: 'conversion-filled' },
    { label: 'Couture Glow', value: 'couture-glow' },
  ],
} as const

export const DEFAULT_SITE_THEME_SETTINGS = {
  colorScheme: 'rose-conversion',
  fontSet: 'default',
  heroLayout: 'centered-editorial',
  productCardDensity: 'boutique-grid',
  sectionMood: 'light-editorial',
  ctaStyle: 'conversion-filled',
} as const

type OptionValue<T extends readonly { value: string }[]> = T[number]['value']

export type SiteThemeSettings = {
  colorScheme: OptionValue<typeof SITE_THEME_OPTIONS.colorSchemes>
  fontSet: OptionValue<typeof SITE_THEME_OPTIONS.fontSets>
  heroLayout: OptionValue<typeof SITE_THEME_OPTIONS.heroLayouts>
  productCardDensity: OptionValue<typeof SITE_THEME_OPTIONS.productCardDensities>
  sectionMood: OptionValue<typeof SITE_THEME_OPTIONS.sectionMoods>
  ctaStyle: OptionValue<typeof SITE_THEME_OPTIONS.ctaStyles>
}

type PartialSiteThemeSettings = Partial<Record<keyof SiteThemeSettings, unknown>> | null | undefined

function normalizeOption<T extends readonly { value: string }[]>(
  options: T,
  value: unknown,
  fallback: OptionValue<T>,
): OptionValue<T> {
  return typeof value === 'string' && options.some((option) => option.value === value)
    ? (value as OptionValue<T>)
    : fallback
}

export function normalizeSiteThemeSettings(settings: PartialSiteThemeSettings): SiteThemeSettings {
  return {
    colorScheme: normalizeOption(
      SITE_THEME_OPTIONS.colorSchemes,
      settings?.colorScheme,
      DEFAULT_SITE_THEME_SETTINGS.colorScheme,
    ),
    fontSet: normalizeOption(
      SITE_THEME_OPTIONS.fontSets,
      settings?.fontSet,
      DEFAULT_SITE_THEME_SETTINGS.fontSet,
    ),
    heroLayout: normalizeOption(
      SITE_THEME_OPTIONS.heroLayouts,
      settings?.heroLayout,
      DEFAULT_SITE_THEME_SETTINGS.heroLayout,
    ),
    productCardDensity: normalizeOption(
      SITE_THEME_OPTIONS.productCardDensities,
      settings?.productCardDensity,
      DEFAULT_SITE_THEME_SETTINGS.productCardDensity,
    ),
    sectionMood: normalizeOption(
      SITE_THEME_OPTIONS.sectionMoods,
      settings?.sectionMood,
      DEFAULT_SITE_THEME_SETTINGS.sectionMood,
    ),
    ctaStyle: normalizeOption(
      SITE_THEME_OPTIONS.ctaStyles,
      settings?.ctaStyle,
      DEFAULT_SITE_THEME_SETTINGS.ctaStyle,
    ),
  }
}
