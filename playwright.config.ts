import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import 'dotenv/config'

// Guard: fail fast if E2E tests would start with unresolved pass:// refs.
const PASSCLI_GUARD_KEYS = [
  'DATABASE_URI',
  'PAYLOAD_SECRET',
  'DATABASE_URL',
  'CRON_SECRET',
  'PREVIEW_SECRET',
  'BLOB_READ_WRITE_TOKEN',
  'VERCEL_OIDC_TOKEN',
  'ETSY_API_KEY',
  'ETSY_SHARED_SECRET',
]

for (const key of PASSCLI_GUARD_KEYS) {
  if (process.env[key]?.startsWith('pass://')) {
    throw new Error(
      'Unresolved pass:// URI detected in ' +
        key +
        '.\n' +
        'E2E tests require pass-cli to resolve secrets.\n' +
        'Run: pass-cli run --env-file .env -- pnpm test:e2e',
    )
  }
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90000,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
  webServer: {
    command: 'pnpm next dev',
    reuseExistingServer: true,
    url: 'http://localhost:3000',
  },
})
