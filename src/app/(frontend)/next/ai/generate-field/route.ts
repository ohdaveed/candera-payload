import { generateObject, gateway } from 'ai'
import { headers } from 'next/headers'
import {
  FIELD_COPY_SYSTEM_PROMPT,
  buildFieldCopyPrompt,
  fieldCopyInputSchema,
  fieldCopyOutputSchema,
} from '@/lib/ai/field-copy'
import { getPayload } from 'payload'
import config from '@payload-config'

export const maxDuration = 30

export async function POST(req: Request): Promise<Response> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: unknown = await req.json()
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
