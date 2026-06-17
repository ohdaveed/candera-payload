import crypto from 'crypto'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const maxDuration = 300

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.VERCEL_WEBHOOK_SECRET
  if (!secret) {
    return Response.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const rawBody = await request.text()
  const headerSignature = request.headers.get('x-vercel-signature')

  const expected = crypto.createHmac('sha1', secret).update(rawBody).digest('hex')

  if (
    !headerSignature ||
    headerSignature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(headerSignature), Buffer.from(expected))
  ) {
    return Response.json({ error: 'Invalid signature' }, { status: 403 })
  }

  const event = JSON.parse(rawBody) as {
    type: string
    payload: { target?: string; meta?: { deploymentId?: string } }
  }

  if (event.type !== 'deployment.succeeded') {
    return Response.json({ skipped: true, reason: 'not deployment.succeeded' })
  }

  if (event.payload?.target !== 'production') {
    return Response.json({ skipped: true, reason: 'not a production deployment' })
  }

  const payload = await getPayload({ config: configPromise })
  await payload.db.migrate()

  return Response.json({ ok: true })
}
