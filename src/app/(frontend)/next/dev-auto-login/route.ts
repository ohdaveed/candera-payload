import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { generatePayloadCookie } from 'payload/shared'
import config from '@payload-config'

// Dev-only convenience: auto-authenticate as the seeded admin so local /admin
// work doesn't require re-typing credentials every session. Triggered by
// src/middleware.ts, which only redirects here when NODE_ENV !== 'production'
// and LOCAL_ADMIN_BYPASS=true — both re-checked here as defense in depth.
export async function GET(request: Request): Promise<Response> {
  const { hostname } = new URL(request.url)
  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1'

  if (
    process.env.NODE_ENV === 'production' ||
    process.env.LOCAL_ADMIN_BYPASS !== 'true' ||
    !isLocalHost
  ) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD

  if (!email || !password) {
    return NextResponse.json(
      { error: 'SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD are not set' },
      { status: 500 },
    )
  }

  const payload = await getPayload({ config })

  const { token } = await payload.login({
    collection: 'users',
    data: { email, password },
  })

  if (!token) {
    return NextResponse.json({ error: 'Local admin login failed' }, { status: 401 })
  }

  const usersConfig = payload.collections.users.config
  const cookie = generatePayloadCookie({
    collectionAuthConfig: usersConfig.auth,
    cookiePrefix: payload.config.cookiePrefix || 'payload',
    token,
  })

  const response = NextResponse.redirect(new URL('/admin', request.url))
  response.headers.append('Set-Cookie', cookie)
  return response
}
