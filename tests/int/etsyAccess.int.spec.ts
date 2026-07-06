import { describe, it, expect } from 'vite-plus/test'
import { syncEtsyEndpoint, etsyOAuthInitEndpoint, setEtsyVacationEndpoint } from '@/endpoints/etsy'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const callSync = (req: any) => syncEtsyEndpoint.handler(req)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const callInit = (req: any) => etsyOAuthInitEndpoint.handler(req)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const callVacation = (req: any) => setEtsyVacationEndpoint.handler(req)

describe('Etsy endpoint access control', () => {
  it('sync-etsy rejects unauthenticated requests', async () => {
    const res = await callSync({
      user: undefined,
      payload: { logger: { error: () => {} } },
    })

    expect([401, 403]).toContain(res.status)
  })

  it('oauth init rejects unauthenticated requests', async () => {
    const res = await callInit({
      user: undefined,
      url: 'http://localhost:3000/api/etsy/oauth/init',
      headers: new Headers(),
    })

    expect([401, 403]).toContain(res.status)
  })

  it('set-vacation rejects unauthenticated requests', async () => {
    const res = await callVacation({
      user: undefined,
      payload: { logger: { error: () => {} } },
    })

    expect([401, 403]).toContain(res.status)
  })
})
