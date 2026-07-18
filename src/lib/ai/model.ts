import { createGateway, gateway } from 'ai'

// The default `gateway` provider is hard-wired to Vercel's hosted AI Gateway.
// Honouring AI_GATEWAY_BASE_URL lets local dev / CI point copy generation at a
// stub gateway when no AI_GATEWAY_API_KEY is available.
const provider = process.env.AI_GATEWAY_BASE_URL
  ? createGateway({ baseURL: process.env.AI_GATEWAY_BASE_URL })
  : gateway

export const COPY_MODEL_ID = 'anthropic/claude-haiku-4-5'

export function copyModel(): ReturnType<typeof gateway> {
  return provider(COPY_MODEL_ID)
}
