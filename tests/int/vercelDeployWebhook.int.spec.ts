import crypto from 'crypto'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vite-plus/test'

// The route boots Payload on the success path; mock it so the suite runs
// without a database and we can observe the migrate() call.
const migrateMock = vi.fn(async () => {})
vi.mock('payload', () => ({
  getPayload: vi.fn(async () => ({ db: { migrate: migrateMock } })),
}))
vi.mock('@payload-config', () => ({ default: {} }))

import { POST } from '@/app/api/webhooks/vercel-deploy/route'

const SECRET = 'test-webhook-secret'

function signedRequest(body: string, opts: { signature?: string } = {}): Request {
  const signature =
    opts.signature ?? crypto.createHmac('sha1', SECRET).update(body).digest('hex')
  return new Request('http://localhost:3000/api/webhooks/vercel-deploy', {
    method: 'POST',
    headers: { 'x-vercel-signature': signature },
    body,
  })
}

const successEvent = JSON.stringify({
  type: 'deployment.succeeded',
  payload: { target: 'production', deployment: { id: 'dpl_123' } },
})

describe('vercel-deploy webhook', () => {
  beforeEach(() => {
    vi.stubEnv('VERCEL_WEBHOOK_SECRET', SECRET)
    migrateMock.mockClear()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns 500 when the webhook secret is not configured', async () => {
    vi.stubEnv('VERCEL_WEBHOOK_SECRET', '')
    const res = await POST(signedRequest(successEvent))
    expect(res.status).toBe(500)
    expect(migrateMock).not.toHaveBeenCalled()
  })

  it('rejects a bad signature with 403 and does not migrate', async () => {
    const res = await POST(
      signedRequest(successEvent, {
        signature: crypto.createHmac('sha1', 'wrong-secret').update(successEvent).digest('hex'),
      }),
    )
    expect(res.status).toBe(403)
    expect(migrateMock).not.toHaveBeenCalled()
  })

  it('rejects a missing signature with 403', async () => {
    const res = await POST(
      new Request('http://localhost:3000/api/webhooks/vercel-deploy', {
        method: 'POST',
        body: successEvent,
      }),
    )
    expect(res.status).toBe(403)
  })

  it('returns 400 for a validly-signed but malformed JSON body', async () => {
    const res = await POST(signedRequest('not-json'))
    expect(res.status).toBe(400)
  })

  it('skips non-deployment.succeeded events', async () => {
    const body = JSON.stringify({ type: 'deployment.created', payload: { target: 'production' } })
    const res = await POST(signedRequest(body))
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ skipped: true })
    expect(migrateMock).not.toHaveBeenCalled()
  })

  it('skips non-production deployments', async () => {
    const body = JSON.stringify({
      type: 'deployment.succeeded',
      payload: { target: 'preview', deployment: { id: 'dpl_456' } },
    })
    const res = await POST(signedRequest(body))
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ skipped: true, reason: 'not a production deployment' })
    expect(migrateMock).not.toHaveBeenCalled()
  })

  it('runs migrations for a signed production deployment.succeeded event', async () => {
    const res = await POST(signedRequest(successEvent))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(migrateMock).toHaveBeenCalledTimes(1)
  })

  it('returns 500 with the deployment id when migration fails', async () => {
    migrateMock.mockRejectedValueOnce(new Error('migration exploded'))
    const res = await POST(signedRequest(successEvent))
    expect(res.status).toBe(500)
    expect(await res.json()).toMatchObject({ error: 'Migration failed', deploymentId: 'dpl_123' })
  })
})
