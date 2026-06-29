import 'dotenv/config'
import { spawnSync } from 'node:child_process'
import { getPayload } from 'payload'
import config from '@payload-config'
import { payloadLogger } from '@/utilities/logger'

/**
 * Create a Payload MCP API key and store it directly in Proton Pass.
 *
 * The generated key is captured in memory and piped to `pass-cli` via stdin —
 * it is never printed, logged, written to disk, or passed as a CLI argument
 * (so it stays out of shell history and the process list). The script prints
 * only the resulting `pass://` reference and a ready-to-run registration command.
 *
 * The key's permissions mirror the collections/globals exposed in
 * `src/plugins/index.ts`: find/create/update are granted; `delete` is OFF unless
 * `--allow-delete` is passed (a deliberate guardrail for a bearer-token-gated
 * endpoint). Collection ops are additionally enforced under the key's linked
 * user (overrideAccess:false); global updates bypass access control, so a key
 * with global write is the sole gate — keep it scoped.
 *
 * The key is minted in whatever database the loaded env points at. To provision
 * for production, run with the production DATABASE_URI and pass the production
 * `--endpoint` (e.g. https://canderacandles.com/api/mcp).
 *
 *   # Local
 *   pass-cli run --env-file .env -- pnpm exec tsx scripts/create-mcp-key.ts --user you@example.com
 *
 *   # Production (point env at Neon, target the live endpoint)
 *   pass-cli run --env-file .env.production -- pnpm exec tsx scripts/create-mcp-key.ts \
 *     --user you@example.com --endpoint https://canderacandles.com/api/mcp
 *
 * Flags / env:
 *   --user     <email>  (MCP_KEY_USER_EMAIL)  user the key is tied to (required)
 *   --label    <text>   (MCP_KEY_LABEL)       human label    [default: "Claude Code MCP (local)"]
 *   --vault    <name>   (PASS_VAULT)          Proton Pass vault  [default: "Google"]
 *   --endpoint <url>    (MCP_ENDPOINT)        MCP URL to register [default: localhost]
 *   --allow-delete                            also grant delete on content collections
 */

const MCP_COLLECTION = 'payload-mcp-api-keys'
const DEFAULT_ENDPOINT = 'http://localhost:3000/api/mcp'
const AGENT_REASON = 'Store Payload MCP API key for Claude Code'

// Mirrors the collections/globals enabled in src/plugins/index.ts (camelCased slugs).
const COLLECTION_KEYS = [
  'folders',
  'pages',
  'posts',
  'products',
  'media',
  'categories',
  'briefs',
  'quizzes',
  'scentProfiles',
  'documentation',
  'howToGuides',
  'redirects',
  'forms',
] as const
const GLOBAL_KEYS = ['header', 'footer', 'siteTheme', 'studioInfo'] as const

function getFlag(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`)
  if (idx !== -1 && idx + 1 < process.argv.length) return process.argv[idx + 1]
  return undefined
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`)
}

function pass(args: string[], input?: string): string {
  const result = spawnSync('pass-cli', args, {
    input,
    encoding: 'utf8',
    env: { ...process.env, PROTON_PASS_AGENT_REASON: AGENT_REASON },
  })
  if (result.error) throw result.error
  if (result.status !== 0) {
    // stderr may echo the template; never include `input` in the message.
    throw new Error(`pass-cli ${args[0]} ${args[1] ?? ''} failed: ${result.stderr.trim()}`)
  }
  return result.stdout
}

async function main(): Promise<void> {
  const userEmail = getFlag('user') ?? process.env.MCP_KEY_USER_EMAIL
  const label = getFlag('label') ?? process.env.MCP_KEY_LABEL ?? 'Claude Code MCP (local)'
  const vault = getFlag('vault') ?? process.env.PASS_VAULT ?? 'Google'
  const endpoint = getFlag('endpoint') ?? process.env.MCP_ENDPOINT ?? DEFAULT_ENDPOINT
  const allowDelete = hasFlag('allow-delete')

  if (!userEmail) {
    payloadLogger.error('Missing --user <email> (or MCP_KEY_USER_EMAIL). Aborting.')
    process.exit(1)
  }

  // Fail fast if pass-cli is unavailable/unauthenticated before we mint a key.
  pass(['test'])

  const payload = await getPayload({ config })

  const { docs: users } = await payload.find({
    collection: 'users',
    where: { email: { equals: userEmail } },
    limit: 1,
    depth: 0,
  })
  const user = users[0]
  if (!user) {
    payloadLogger.error(`No user found with email "${userEmail}". Aborting.`)
    process.exit(1)
  }

  // Per-key permission checkboxes (default false in the schema, so set explicitly).
  const collectionPerms = Object.fromEntries(
    COLLECTION_KEYS.map((k) => [
      k,
      { find: true, create: true, update: true, delete: allowDelete },
    ]),
  )
  const globalPerms = Object.fromEntries(GLOBAL_KEYS.map((k) => [k, { find: true, update: true }]))

  // A unique title so we can resolve the stored item's id afterward.
  const title = `Candera MCP API Key — ${label} [${user.id}-${Date.now()}]`

  // Generate random API key locally because disableLocalStrategy might prevent auto-generation on create
  const crypto = await import('node:crypto')
  const generatedKey = crypto.randomBytes(24).toString('hex')

  // Mint the key.
  const created = await payload.create({
    collection: MCP_COLLECTION,
    data: {
      user: user.id,
      label,
      description: `MCP access for ${userEmail}`,
      enableAPIKey: true,
      apiKey: generatedKey,
      ...collectionPerms,
      ...globalPerms,
    },
  })

  const apiKey = generatedKey
  if (!apiKey) {
    payloadLogger.error('Payload did not return an apiKey on create. Aborting (no item written).')
    process.exit(1)
  }

  // Hand the key to Proton Pass via stdin — never as an argv or log line.
  try {
    const template = JSON.stringify({
      title,
      username: userEmail,
      password: apiKey,
      urls: [endpoint],
    })
    pass(['item', 'create', 'login', '--vault-name', vault, '--from-template', '-'], template)
  } catch (err) {
    payloadLogger.error({
      msg: `Failed to write to Proton Pass. A Payload key (id ${created.id}) WAS created — revoke it in /admin if unused.`,
      err: err as Error,
    })
    process.exit(1)
  }

  // Resolve pass:// reference: share_id from the vault, item_id by exact title.
  const vaults = JSON.parse(pass(['vault', 'list', '--output', 'json'])).vaults as Array<{
    name: string
    share_id: string
  }>
  const shareId = vaults.find((v) => v.name === vault)?.share_id
  const items = JSON.parse(
    pass(['item', 'list', vault, '--filter-type', 'login', '--output', 'json']),
  ).items as Array<{ id: string; title: string }>
  const itemId = items.find((i) => i.title === title)?.id

  if (!shareId || !itemId) {
    payloadLogger.warn(
      `Key stored in Proton Pass vault "${vault}" as "${title}", but could not auto-resolve the pass:// reference. Look it up with: pass-cli item list ${vault}`,
    )
    process.exit(0)
  }

  const ref = `pass://${shareId}/${itemId}/password`

  payloadLogger.success(
    `MCP API key created (Payload id ${created.id}, delete ${allowDelete ? 'ENABLED' : 'disabled'}) and stored in Proton Pass.`,
  )
  // The key itself is intentionally never printed — only its reference.
  payloadLogger.box(
    [
      'Add to .env:',
      `  PAYLOAD_MCP_API_KEY=${ref}`,
      '',
      'Register with Claude Code (run through pass-cli so the key resolves at runtime):',
      '  pass-cli run --env-file .env -- \\',
      `    claude mcp add --transport http --scope local payload-cms ${endpoint} \\`,
      "    --header 'Authorization: Bearer ${PAYLOAD_MCP_API_KEY}'",
    ].join('\n'),
  )

  process.exit(0)
}

main().catch((err) => {
  payloadLogger.error({ msg: 'create-mcp-key failed', err: err as Error })
  process.exit(1)
})
