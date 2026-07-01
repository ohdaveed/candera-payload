import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Dev-only: skip Payload's admin login screen by redirecting straight to the
// auto-login route. Gated on NODE_ENV !== 'production' (never true for a
// Vercel build, preview or prod) plus an explicit opt-in flag, so this is
// inert unless a developer deliberately sets LOCAL_ADMIN_BYPASS=true locally.
// 'payload-token' matches the default cookiePrefix (unset in payload.config.ts).
export function middleware(request: NextRequest): NextResponse {
  const bypassEnabled =
    process.env.NODE_ENV !== 'production' &&
    process.env.LOCAL_ADMIN_BYPASS === 'true' &&
    ['localhost', '127.0.0.1'].includes(request.nextUrl.hostname)

  if (!bypassEnabled || request.cookies.has('payload-token')) {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL('/next/dev-auto-login', request.url))
}

export const config = {
  matcher: ['/admin/login'],
}
