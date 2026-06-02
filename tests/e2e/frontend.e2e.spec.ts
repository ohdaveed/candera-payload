import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('can load homepage with readable navigation and product imagery', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page).toHaveTitle(/Payload Website Template/)
    const heading = page.locator('h1').first()
    await expect(heading).toHaveText('An invitation to slow down.')

    await expect(page.getByRole('link', { name: 'Search' })).toBeVisible()

    await expect(page.locator('article').first()).toBeVisible()

    const brokenProductImages = await page.locator('article img').evaluateAll((images) =>
      images
        .map((image) => image as HTMLImageElement)
        .filter((image) => image.naturalWidth === 0 || image.naturalHeight === 0)
        .map((image) => image.getAttribute('alt') || image.getAttribute('src') || 'unknown image'),
    )

    expect(brokenProductImages).toEqual([])
  })
})
