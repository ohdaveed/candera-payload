import { payloadLogger } from './logger'

export type SitemapEntry = {
  loc: string
  lastmod: string
}

/**
 * Preview deployments can fail static generation when a fresh Neon branch is not
 * ready yet. Fall back to minimal sitemap entries so the deployment check passes.
 */
export async function withPreviewSitemapFallback(
  loader: () => Promise<SitemapEntry[]>,
  fallback: SitemapEntry[],
): Promise<SitemapEntry[]> {
  try {
    return await loader()
  } catch (error) {
    if (process.env.VERCEL_ENV === 'preview') {
      payloadLogger.warn(
        { err: error },
        'Preview sitemap generation failed; using fallback entries',
      )
      return fallback
    }

    throw error
  }
}
