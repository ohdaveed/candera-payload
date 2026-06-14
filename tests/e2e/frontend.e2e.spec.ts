import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('can load homepage with readable navigation and product imagery', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page).toHaveTitle(/Candera/)
    const heading = page.locator('h1').first()
    await expect(heading).toHaveText(
      /Anchor your space with sixty hours of intention and botanical stillness/i,
    )

    await expect(page.getByRole('link', { name: 'Search' })).toBeVisible()

    await expect(page.locator('main li').first()).toBeVisible()

    const brokenProductImages = await page.locator('main li img').evaluateAll((images) =>
      images
        .map((image) => image as HTMLImageElement)
        .filter((image) => image.naturalWidth === 0 || image.naturalHeight === 0)
        .map((image) => image.getAttribute('alt') || image.getAttribute('src') || 'unknown image'),
    )

    expect(brokenProductImages).toEqual([])
  })
})
