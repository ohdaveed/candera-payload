import { draftMode } from 'next/headers'

/** Disables Next.js draft mode and returns a plain text confirmation. */
export async function GET(): Promise<Response> {
  const draft = await draftMode()
  draft.disable()
  return new Response('Draft mode is disabled')
}
