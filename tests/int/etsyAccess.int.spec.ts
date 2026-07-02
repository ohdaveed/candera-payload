import { describe, it, expect } from 'vite-plus/test'
import {
  syncEtsyEndpoint,
  etsyOAuthInitEndpoint,
  setEtsyVacationEndpoint,
} from '@/endpoints/etsy'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const call = (endpoint: { handler: (req: any) => Promise<Response> }, req: any) =>
  endpoint.handler(req)

describe('Etsy endpoint access control', () => {
  it('sync-etsy rejects unauthenticated requests', async () => {
    const res = await call(syncEtsyEndpoint, {
      user: undefined,
      payload: { logger: { error: () => {} } },
    })

    expect([401, 403]).toContain(res.status)
  })

  it('oauth init rejects unauthenticated requests', async () => {
    const res = await call(etsyOAuthInitEndpoint, {
      user: undefined,
      url: 'http://localhost:3000/api/etsy/oauth/init',
      headers: new Headers(),
    })

    expect([401, 403]).toContain(res.status)
  })

  it('set-vacation rejects unauthenticated requests', async () => {
    const res = await call(setEtsyVacationEndpoint, {
      user: undefined,
      payload: { logger: { error: () => {} } },
    })

    expect([401, 403]).toContain(res.status)
  })
})
