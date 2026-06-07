import { generateObject, gateway } from 'ai'
import { SYSTEM_PROMPTS, buildUserPrompt, inputSchema, outputSchema } from '@/lib/ai/product-copy'

export const maxDuration = 30

export async function POST(req: Request): Promise<Response> {
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
