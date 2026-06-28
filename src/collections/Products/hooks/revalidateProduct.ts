import { CollectionAfterChangeHook } from 'payload'
import { revalidateTag } from 'next/cache'

export const revalidateProduct: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  operation,
}) => {
  if (operation === 'update' || operation === 'create') {
    if (doc.slug) {
      revalidateTag(`products_${doc.slug}`)
    }
    if (previousDoc && previousDoc.slug && previousDoc.slug !== doc.slug) {
      revalidateTag(`products_${previousDoc.slug}`)
    }
  }
  return doc
}
