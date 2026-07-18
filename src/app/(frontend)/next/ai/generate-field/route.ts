import { generateObject } from 'ai'
import { headers } from 'next/headers'
import { SYSTEM_PROMPTS } from '@/lib/ai/product-copy'
import {
  buildFieldGenerationPrompt,
  fieldGenerationInputSchema,
  fieldGenerationOutputSchema,
} from '@/lib/ai/field-copy'
import { copyModel } from '@/lib/ai/model'
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
  const parsed = fieldGenerationInputSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: 'Invalid input' }, { status: 400 })
  }

  const input = parsed.data

  try {
    const { object } = await generateObject({
      model: copyModel(),
      system: SYSTEM_PROMPTS[input.tone],
      prompt: buildFieldGenerationPrompt(input),
      schema: fieldGenerationOutputSchema,
    })

    return Response.json(object)
  } catch (err) {
    // Gateway outage, missing credential, rate limit, or a model output that
    // fails the schema all land here — log it and return a clean 502 instead of
    // an opaque unhandled 500.
    payload.logger.error({ err, msg: 'AI field generation failed' })
    return Response.json(
      { error: 'Generation is temporarily unavailable. Please try again.' },
      { status: 502 },
    )
  }
}
