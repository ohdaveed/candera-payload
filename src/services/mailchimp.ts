const API_KEY = process.env.MAILCHIMP_API_KEY
const SERVER = process.env.MAILCHIMP_SERVER_PREFIX
const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID

type MergeFields = Record<string, string>

// MD5 hash of lowercase email — Mailchimp's member identifier
async function md5(email: string): Promise<string> {
  const { createHash } = await import('crypto')
  return createHash('md5').update(email.toLowerCase()).digest('hex')
}

export async function upsertSubscriber(
  email: string,
  tags: string[],
  mergeFields: MergeFields = {},
): Promise<void> {
  if (!API_KEY || !SERVER || !AUDIENCE_ID) {
    console.warn('[mailchimp] Skipping sync — MAILCHIMP_* env vars not set')
    return
  }

  const hash = await md5(email)
  const url = `https://${SERVER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members/${hash}`

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Basic ${Buffer.from(`anystring:${API_KEY}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email_address: email,
      status_if_new: 'subscribed',
      merge_fields: mergeFields,
    }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(`[mailchimp] upsertSubscriber failed: ${res.status} — ${JSON.stringify(body)}`)
  }

  // Apply tags in a separate call (Mailchimp tags API)
  if (tags.length > 0) {
    const tagsUrl = `https://${SERVER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members/${hash}/tags`
    const tagsRes = await fetch(tagsUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${API_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tags: tags.map((name) => ({ name, status: 'active' })),
      }),
    })

    if (!tagsRes.ok) {
      const body = await tagsRes.json().catch(() => ({}))
      throw new Error(`[mailchimp] tags update failed: ${tagsRes.status} — ${JSON.stringify(body)}`)
    }
  }
}
