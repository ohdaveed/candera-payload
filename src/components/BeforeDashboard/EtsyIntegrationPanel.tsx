'use client'

import { useState } from 'react'
import { useAuth } from '@payloadcms/ui'
import { SectionTooltip } from './SectionTooltip'

type SyncResponse = {
  success?: boolean
  count?: number
  failures?: string[]
  error?: string
}

function userIsAdmin(user: unknown): boolean {
  return Boolean(
    user &&
    typeof user === 'object' &&
    'roles' in user &&
    Array.isArray((user as { roles?: string[] }).roles) &&
    (user as { roles: string[] }).roles.includes('admin'),
  )
}

export function EtsyIntegrationPanel() {
  const { user } = useAuth()
  const [syncing, setSyncing] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!userIsAdmin(user)) {
    return null
  }

  async function handleSync() {
    setSyncing(true)
    setError(null)
    setStatus(null)

    try {
      const res = await fetch('/api/sync-etsy', { credentials: 'include' })
      const data = (await res.json()) as SyncResponse

      if (!res.ok) {
        throw new Error(data.error || `Sync failed (${res.status})`)
      }

      const failureCount = data.failures?.length ?? 0
      setStatus(
        failureCount > 0
          ? `Synced ${data.count ?? 0} listings with ${failureCount} warning(s).`
          : `Synced ${data.count ?? 0} listings successfully.`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <section style={{ marginBottom: '2rem' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}
      >
        <h2
          style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--theme-elevation-700)',
            margin: 0,
          }}
        >
          Etsy Integration
        </h2>
        <SectionTooltip
          title="Etsy Integration"
          content="Connect your Etsy shop and sync listings into Products. OAuth is required before the first sync."
        />
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        <a
          href="/api/etsy/oauth/init"
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.8125rem',
            borderRadius: '4px',
            border: '1px solid var(--theme-elevation-150)',
            background: 'var(--theme-elevation-50)',
            color: 'var(--theme-text)',
            textDecoration: 'none',
          }}
        >
          Connect Etsy
        </a>

        <button
          type="button"
          onClick={() => void handleSync()}
          disabled={syncing}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.8125rem',
            borderRadius: '4px',
            border: '1px solid var(--theme-elevation-150)',
            background: 'var(--theme-elevation-100)',
            cursor: syncing ? 'not-allowed' : 'pointer',
            opacity: syncing ? 0.6 : 1,
          }}
        >
          {syncing ? 'Syncing…' : 'Sync Listings'}
        </button>
      </div>

      {status && (
        <p
          style={{
            marginTop: '0.75rem',
            marginBottom: 0,
            fontSize: '0.8125rem',
            color: 'var(--theme-success-500, #22c55e)',
          }}
        >
          {status}
        </p>
      )}

      {error && (
        <p
          style={{
            marginTop: '0.75rem',
            marginBottom: 0,
            fontSize: '0.8125rem',
            color: 'var(--theme-error-500)',
          }}
        >
          {error}
        </p>
      )}
    </section>
  )
}
