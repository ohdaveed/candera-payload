import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { nextCacheBuster } from '@/utilities/revalidate'

const formTag = (title: string) => `form_${title.toLowerCase().replace(/\s+/g, '_')}`

export const revalidateForm: CollectionAfterChangeHook = ({ doc, req: { payload } }) => {
  const tag = formTag(doc.title as string)
  payload.logger.info(`Revalidating form cache: ${tag}`)
  void nextCacheBuster.revalidateTag(tag)
  return doc
}

export const revalidateFormOnDelete: CollectionAfterDeleteHook = ({ doc, req: { payload } }) => {
  const tag = formTag(doc.title as string)
  payload.logger.info(`Revalidating form cache on delete: ${tag}`)
  void nextCacheBuster.revalidateTag(tag)
}
