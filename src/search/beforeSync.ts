import { BeforeSync, DocToSync } from '@payloadcms/plugin-search/types'

export const beforeSyncWithSearch: BeforeSync = async ({ req, originalDoc, searchDoc }) => {
  const {
    doc: { relationTo: collection },
  } = searchDoc

  const { slug, id, categories, title, meta } = originalDoc

  const modifiedDoc: DocToSync = {
    ...searchDoc,
    slug,
    meta: {
      ...meta,
      title: meta?.title || title,
      image: meta?.image?.id || meta?.image,
      description: meta?.description,
    },
    categories: [],
  }

  if (categories && Array.isArray(categories) && categories.length > 0) {
    const categoryIds = categories.filter(
      (category) => category && typeof category !== 'object',
    ) as (string | number)[]
    const populatedCategories: { id: string | number; title: string }[] = categories.filter(
      (category) => category && typeof category === 'object',
    ) as { id: string | number; title: string }[]

    if (categoryIds.length > 0) {
      const { docs: fetchedCategories } = await req.payload.find({
        collection: 'categories',
        depth: 0,
        pagination: false,
        req,
        select: { title: true },
        where: {
          id: {
            in: categoryIds,
          },
        },
      })

      populatedCategories.push(...(fetchedCategories as { id: string | number; title: string }[]))

      if (fetchedCategories.length < categoryIds.length) {
        console.error(
          `Failed. Some categories not found when syncing collection '${collection}' with id: '${id}' to search.`,
        )
      }
    }

    modifiedDoc.categories = populatedCategories.map((each) => ({
      relationTo: 'categories',
      categoryID: String(each.id),
      title: each.title,
    }))
  }

  return modifiedDoc
}
