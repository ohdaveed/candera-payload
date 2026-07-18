/**
 * Minimal stub of the Vercel AI Gateway for local development and manual
 * testing when no AI_GATEWAY_API_KEY is available.
 *
 * Usage:
 *   node scripts/mock-ai-gateway.mjs            # listens on :8317
 *   AI_GATEWAY_BASE_URL=http://localhost:8317 AI_GATEWAY_API_KEY=mock pnpm dev
 *
 * Implements just enough of the gateway language-model protocol (spec v3)
 * for `generateObject` calls from the AI copy endpoints to succeed.
 */
import { createServer } from 'node:http'

const PORT = Number(process.env.MOCK_AI_GATEWAY_PORT) || 8317

const SUGGESTIONS = [
  'Warmth gathered in amber glass, poured slowly',
  'A quiet ritual of cedar and candlelight',
  'Sixty hours of intention, one flame at a time',
  'Evening settles softly where this flame burns',
  'Hand-poured stillness for the rooms you love',
]

let callCount = 0

function extractField(prompt) {
  try {
    const text = prompt
      .flatMap((m) => (Array.isArray(m.content) ? m.content : []))
      .filter((p) => p.type === 'text')
      .map((p) => p.text)
      .join('\n')
    const match = text.match(/Field: (.+) \(/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

const server = createServer((req, res) => {
  if (req.method !== 'POST' || !req.url?.includes('language-model')) {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'not found' }))
    return
  }

  let body = ''
  req.on('data', (chunk) => (body += chunk))
  req.on('end', () => {
    let fieldLabel = null
    try {
      fieldLabel = extractField(JSON.parse(body).prompt)
    } catch {
      // ignore malformed bodies; fall back to a generic suggestion
    }

    const base = SUGGESTIONS[callCount % SUGGESTIONS.length]
    callCount += 1
    const suggestion = fieldLabel ? `${base} — for ${fieldLabel}` : base

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        content: [{ type: 'text', text: JSON.stringify({ suggestion }) }],
        finishReason: 'stop',
        usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
        warnings: [],
      }),
    )
  })
})

server.listen(PORT, () => {
  console.log(`Mock AI gateway listening on http://localhost:${PORT}`)
})
