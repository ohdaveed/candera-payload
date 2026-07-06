export const LOGIN_THEME_COLORS = [
  '#faeffd',
  '#615e62',
  '#beb8bf',
  '#3d3b3e',
  '#1f1e1f',
  '#827e83',
  '#d7d7d7',
  '#dad0dc',
  '#a39fa4',
] as const

export const LOGIN_THEME_LIGHT_TEXT = '#faeffd'
export const LOGIN_THEME_DARK_TEXT = '#1f1e1f'

export function normalizeLoginThemeIndex(index: unknown): number {
  const isValidInteger = typeof index === 'number' && Number.isInteger(index)
  const n = isValidInteger ? index : 0
  const length = LOGIN_THEME_COLORS.length
  return ((n % length) + length) % length
}

export function getNextLoginThemeIndex(currentIndex: number): number {
  return normalizeLoginThemeIndex(currentIndex + 1)
}

export function getLoginThemeColor(index: number): string {
  return LOGIN_THEME_COLORS[normalizeLoginThemeIndex(index)]
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '')
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  }
}

export function getLoginThemeTextColor(hex: string): string {
  const { r, g, b } = hexToRgb(hex)
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luma >= 0.5 ? LOGIN_THEME_DARK_TEXT : LOGIN_THEME_LIGHT_TEXT
}
