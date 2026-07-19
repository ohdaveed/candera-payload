import { generateObject } from 'ai'
import { headers } from 'next/headers'
import {
  buildFieldCopyPrompt,
  fieldCopyInputSchema,
  fieldCopyOutputSchema,
  fieldSystemPrompt,
} from '@/lib/ai/field-copy'
import { copyModel } from '@/lib/ai/model'
import { createRateLimiter } from '@/lib/ai/rate-limit'
import { userIsAdmin } from '@/access/isAdmin'
import { getPayload } from 'payload'
import config from '@payload-config'

export const maxDuration = 30

// Cheap per-instance guard so a runaway loop or stale session can't burn
// AI Gateway quota — generation is a human-clicks-a-button flow.
const isAllowed = createRateLimiter({ limit: 10, windowMs: 60_000 })

export async function POST(req: Request): Promise<Response> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  // Admin-role users only (matching the admin panel's own access gate).
  // `payload.auth` also accepts MCP API keys (plugin-mcp stamps
  // `_strategy: 'mcp-api-key'` on a `users`-collection user; the property is
  // runtime-only, hence the structural read) — those must stay confined to
  // the MCP endpoint's own allowlist.
  const strategy = (user as null | { _strategy?: string })?._strategy
  if (
    !user ||
    user.collection !== 'users' ||
    strategy === 'mcp-api-key' ||
    !userIsAdmin(user)
  ) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isAllowed(String(user.id))) {
    return Response.json(
      { error: 'Too many generation requests — wait a minute and try again.' },
      { status: 429 },
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const parsed = fieldCopyInputSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: 'Invalid input' }, { status: 400 })
  }

  const input = parsed.data

  try {
    const { object } = await generateObject({
      model: copyModel(),
      system: fieldSystemPrompt(input.tone),
      prompt: buildFieldCopyPrompt(input),
      schema: fieldCopyOutputSchema,
    })

    // The model occasionally ignores character limits — trim rather than fail.
    const suggestion = input.maxLength
      ? object.suggestion.slice(0, input.maxLength)
      : object.suggestion

    return Response.json({ suggestion })
  } catch (err) {
    // Gateway outage, missing credential, rate limit, or a model output that
    // fails the schema all land here — log it and return a clean 502 instead of
    // an opaque unhandled 500.
    payload.logger.error({ err, msg: 'AI field-copy generation failed' })
    return Response.json(
      { error: 'Copy generation is temporarily unavailable. Please try again.' },
      { status: 502 },
    )
  }
}
