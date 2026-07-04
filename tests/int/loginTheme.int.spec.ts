import { describe, expect, it } from 'vite-plus/test'
import {
  LOGIN_THEME_COLORS,
  getLoginThemeColor,
  getLoginThemeTextColor,
  getNextLoginThemeIndex,
  normalizeLoginThemeIndex,
} from '@/utilities/loginTheme'

describe('login theme cycler', () => {
  it('has 9 preset colors', () => {
    expect(LOGIN_THEME_COLORS).toHaveLength(9)
  })

  it('has the exact palette in the requested order', () => {
    expect(LOGIN_THEME_COLORS).toEqual([
      '#faeffd',
      '#615e62',
      '#beb8bf',
      '#3d3b3e',
      '#1f1e1f',
      '#827e83',
      '#d7d7d7',
      '#dad0dc',
      '#a39fa4',
    ])
  })

  it('advances sequentially through the middle of the list', () => {
    expect(getNextLoginThemeIndex(3)).toBe(4)
  })

  it('wraps from the last index back to the first', () => {
    expect(getNextLoginThemeIndex(8)).toBe(0)
  })

  it('normalizes out-of-range or invalid indexes to a valid index', () => {
    expect(normalizeLoginThemeIndex(9)).toBe(0)
    expect(normalizeLoginThemeIndex(-1)).toBe(8)
    expect(normalizeLoginThemeIndex('nope')).toBe(0)
    expect(normalizeLoginThemeIndex(undefined)).toBe(0)
    expect(normalizeLoginThemeIndex(2.5)).toBe(0)
  })

  it('picks dark text for the lightest background', () => {
    expect(getLoginThemeTextColor(getLoginThemeColor(0))).toBe('#1f1e1f')
  })

  it('picks light text for the darkest background', () => {
    expect(getLoginThemeTextColor(getLoginThemeColor(4))).toBe('#faeffd')
  })

  it('picks dark text for the mid-gray color at index 5', () => {
    expect(getLoginThemeTextColor(getLoginThemeColor(5))).toBe('#1f1e1f')
  })
})
