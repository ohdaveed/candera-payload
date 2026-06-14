import { generateObject, gateway } from 'ai'
import { headers } from 'next/headers'
import { SYSTEM_PROMPTS, buildUserPrompt, inputSchema, outputSchema } from '@/lib/ai/product-copy'
import { getPayload } from 'payload'
import config from '@payload-config'

export const maxDuration = 30

async function requireAuthenticatedUser() {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  return Boolean(user)
}

export async function POST(req: Request): Promise<Response> {
  const isAuthenticated = await requireAuthenticatedUser()

  if (!isAuthenticated) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: unknown = await req.json()
  const parsed = inputSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: 'Invalid input' }, { status: 400 })
  }

  const input = parsed.data

  const { object } = await generateObject({
    model: gateway('anthropic/claude-haiku-4-5'),
    system: SYSTEM_PROMPTS[input.tone],
    prompt: buildUserPrompt(input),
    schema: outputSchema,
  })

  return Response.json(object)
}
