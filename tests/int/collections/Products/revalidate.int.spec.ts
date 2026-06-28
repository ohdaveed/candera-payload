import { expect, test, vi } from 'vitest'
import { revalidateProduct } from '@/collections/Products/hooks/revalidateProduct'
import { revalidateTag } from 'next/cache'

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}))

test('revalidateProduct should call revalidateTag', () => {
  const doc = { slug: 'test-product' }
  revalidateProduct({ doc, previousDoc: { slug: 'old-slug' }, operation: 'update' } as any)
  expect(revalidateTag).toHaveBeenCalledWith('products_test-product', 'max' as any)
  expect(revalidateTag).toHaveBeenCalledWith('products_old-slug', 'max' as any)
})
