import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import type { Form } from '@/payload-types'
import { logger } from '@/utilities/logger'

async function getFormByTitle(title: string): Promise<Form | null> {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'forms',
      where: { title: { equals: title } },
      limit: 1,
      depth: 0,
    })
    return (result.docs[0] as Form) ?? null
  } catch (err) {
    logger.error(err, `getForms: failed to fetch form "${title}"`)
    return null
  }
}

/**
 * Returns an unstable_cache function keyed by form title.
 * Tag: form_<title_snake_case> — revalidate via revalidateTag() when forms change.
 */
export const getCachedFormByTitle = (title: string) =>
  unstable_cache(async () => getFormByTitle(title), [`form_by_title_${title}`], {
    tags: [`form_${title.toLowerCase().replace(/\s+/g, '_')}`],
  })
