import { generateObject, gateway } from 'ai'
import { cookies } from 'next/headers'
import { SYSTEM_PROMPTS, buildUserPrompt, inputSchema, outputSchema } from '@/lib/ai/product-copy'
import { getClientSideURL } from '@/utilities/getURL'

export const maxDuration = 30

async function requireAuthenticatedUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  if (!token) {
    return false
  }

  const meUserReq = await fetch(`${getClientSideURL()}/api/users/me`, {
    cache: 'no-store',
    headers: {
      Authorization: `JWT ${token}`,
    },
  })

  if (!meUserReq.ok) {
    return false
  }

  const { user }: { user?: unknown } = await meUserReq.json()
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
