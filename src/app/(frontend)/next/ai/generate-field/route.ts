import { generateObject, gateway } from 'ai'
import { headers } from 'next/headers'
import {
  FIELD_COPY_SYSTEM_PROMPT,
  buildFieldCopyPrompt,
  fieldCopyInputSchema,
  fieldCopyOutputSchema,
} from '@/lib/ai/field-copy'
import { InMemoryRateLimiter, type RateLimiter } from '@/utilities/formRateLimit'
import { getPayload } from 'payload'
import config from '@payload-config'

export const maxDuration = 30

// Per-instance sliding window — see formRateLimit.ts's LIMITATION note (state
// isn't shared across serverless instances, so this blunts naive loops from a
// single warm instance rather than acting as durable bot mitigation). Typed
// as the RateLimiter interface (not the concrete class) so a future
// async/durable implementation is a drop-in swap.
const aiGenerateLimiter: RateLimiter = new InMemoryRateLimiter(60_000, 10)

export async function POST(req: Request): Promise<Response> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const allowed = await aiGenerateLimiter.check(`ai-generate-field:${user.id}`)
  if (!allowed) {
    return Response.json(
      { error: 'Too many generation requests. Please wait a moment and try again.' },
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
      model: gateway('anthropic/claude-haiku-4-5'),
      system: FIELD_COPY_SYSTEM_PROMPT,
      prompt: buildFieldCopyPrompt(input),
      schema: fieldCopyOutputSchema,
    })

    // `text` fields hold a single line — the prompt says so, but the model
    // occasionally ignores that instruction, so normalize rather than trust it.
    const normalized =
      input.variant === 'text' ? object.suggestion.replace(/\r\n|\r|\n/g, ' ') : object.suggestion

    // The model occasionally ignores character limits — trim rather than fail.
    const suggestion = input.maxLength ? normalized.slice(0, input.maxLength) : normalized

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
