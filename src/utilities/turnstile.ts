export async function verifyTurnstileToken(token: string, ip?: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY || '1x00000000000000000000000000000000'

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
        remoteip: ip,
      }),
    })

    const data = (await res.json()) as { success: boolean }
    return data.success
  } catch (error) {
    console.error('Turnstile verification failed:', error)
    return false
  }
}
