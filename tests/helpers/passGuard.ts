// Shared fail-fast guard for test entrypoints: if .env still contains
// unresolved pass:// references, secrets were not injected via pass-cli and
// anything touching the DB or external APIs would fail confusingly later.
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

export function assertNoUnresolvedPassRefs(suiteLabel: string, runHint: string): void {
  for (const key of PASSCLI_GUARD_KEYS) {
    if (process.env[key]?.startsWith('pass://')) {
      throw new Error(
        `Unresolved pass:// URI detected in ${key}.\n` +
          `${suiteLabel} require pass-cli to resolve secrets.\n` +
          `Run: ${runHint}`,
      )
    }
  }
}
