/**
 * Unified seed CLI — consolidates the former seed-* scripts into one entrypoint.
 *
 *   tsx scripts/seed.ts <subcommand>
 *
 * Subcommand modules live in scripts/seed/ and are loaded lazily so the
 * --help / usage paths never touch the Payload config or the database.
 */
import 'dotenv/config'

type SeedModule = { run: () => Promise<void> }

type Subcommand = {
  description: string
  errorLabel: string
  load: () => Promise<SeedModule>
}

const SUBCOMMANDS: Record<string, Subcommand> = {
  admin: {
    description: 'Create the initial admin user if no users exist (SEED_ADMIN_* env vars)',
    errorLabel: 'Failed to seed admin user:',
    load: () => import('./seed/admin'),
  },
  db: {
    description: 'Full destructive content seed (overwrites data; requires an existing admin)',
    errorLabel: 'Seed failed:',
    load: () => import('./seed/db'),
  },
  'initial-users': {
    description: 'Idempotently create the primary/secondary admins (SEED_*_ADMIN_* env vars)',
    errorLabel: 'Failed to seed initial users:',
    load: () => import('./seed/initial-users'),
  },
  instructional: {
    description: 'Seed tutorial products, posts, folders, and media for admin training',
    errorLabel: 'Failed to seed instructional content:',
    load: () => import('./seed/instructional'),
  },
  'legal-pages': {
    description: 'Create any missing legal pages and refresh the Footer global links',
    errorLabel: 'Seed failed:',
    load: () => import('./seed/legal-pages'),
  },
  'owner-guide': {
    description: 'Replace the owner documentation collection (front-end content untouched)',
    errorLabel: 'Failed to refresh owner documentation:',
    load: () => import('./seed/owner-guide'),
  },
  reseed: {
    description: 'Destructive full reseed, bootstrapping a temporary admin user if needed',
    errorLabel: 'Reseed failed:',
    load: () => import('./seed/reseed'),
  },
}

const usage = (): string => {
  const width = Math.max(...Object.keys(SUBCOMMANDS).map((name) => name.length))
  const lines = ['Usage: tsx scripts/seed.ts <subcommand>', '', 'Subcommands:']
  for (const [name, { description }] of Object.entries(SUBCOMMANDS)) {
    lines.push(`  ${name.padEnd(width + 2)}${description}`)
  }
  lines.push('', 'Options:', `  ${'-h, --help'.padEnd(width + 2)}Show this help message`)
  return lines.join('\n')
}

const main = async (): Promise<void> => {
  const [arg] = process.argv.slice(2)

  if (arg === '--help' || arg === '-h') {
    console.log(usage())
    process.exit(0)
  }

  if (!arg) {
    console.error('Missing subcommand.\n')
    console.error(usage())
    process.exit(1)
  }

  const subcommand = SUBCOMMANDS[arg]
  if (!subcommand) {
    console.error(`Unknown subcommand: ${arg}\n`)
    console.error(usage())
    process.exit(1)
  }

  try {
    const { run } = await subcommand.load()
    await run()
    process.exit(0)
  } catch (err) {
    const { seedLogger } = await import('@/utilities/logger')
    seedLogger.error(subcommand.errorLabel, err)
    process.exit(1)
  }
}

void main()
