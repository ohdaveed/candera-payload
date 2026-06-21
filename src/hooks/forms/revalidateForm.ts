import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidateTag } from 'next/cache'

const formTag = (title: string) => `form_${title.toLowerCase().replace(/\s+/g, '_')}`

export const revalidateForm: CollectionAfterChangeHook = ({ doc, req: { payload } }) => {
  const tag = formTag(doc.title as string)
  payload.logger.info(`Revalidating form cache: ${tag}`)
  revalidateTag(tag, 'max')
  return doc
}

export const revalidateFormOnDelete: CollectionAfterDeleteHook = ({ doc, req: { payload } }) => {
  const tag = formTag(doc.title as string)
  payload.logger.info(`Revalidating form cache on delete: ${tag}`)
  revalidateTag(tag, 'max')
}
