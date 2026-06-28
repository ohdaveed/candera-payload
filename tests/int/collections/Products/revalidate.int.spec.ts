import { expect, test, vi } from 'vite-plus/test'
import { revalidateProduct } from '@/collections/Products/hooks/revalidateProduct'
import { revalidateTag } from 'next/cache'

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}))

test('revalidateProduct should call revalidateTag', () => {
  const doc = { slug: 'test-product' }
  revalidateProduct({ doc, previousDoc: { slug: 'old-slug' }, operation: 'update' } as any)
  expect(revalidateTag).toHaveBeenCalledWith('products_test-product', 'max')
  expect(revalidateTag).toHaveBeenCalledWith('products_old-slug', 'max')
})
