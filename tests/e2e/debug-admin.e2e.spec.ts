import { test } from '@playwright/test'

test('debug admin login', async ({ page }) => {
  await page.goto('http://localhost:3000/admin/login')
  await page.getByRole('textbox', { name: /email/i }).fill('dev@candera.com')
  await page.getByRole('textbox', { name: /password/i }).fill('test1234')

  console.log('Clicking submit...')
  await page.click('button[type="submit"]')

  try {
    await page.waitForURL('**/admin', { timeout: 10000 })
    console.log('Navigation successful to:', page.url())
  } catch {
    console.log('Navigation failed or timed out.')
    const errorMsg = await page
      .locator('.toast__message')
      .textContent()
      .catch(() => 'No toast message found')
    console.log('Error message if any:', errorMsg)
    console.log('Current URL:', page.url())
  }
})
