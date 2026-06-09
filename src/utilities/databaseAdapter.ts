export function shouldUseVercelPostgresAdapter(connectionString: string): boolean {
  if (!connectionString) {
    return false
  }

  try {
    const hostname = new URL(connectionString).hostname.toLowerCase()
    return hostname === 'neon.tech' || hostname.endsWith('.neon.tech')
  } catch {
    return false
  }
}
