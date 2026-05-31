import { put } from '@vercel/blob'

export async function testBlob() {
  try {
    const { url } = await put('articles/blob.txt', 'Hello World!', { access: 'public' })
    console.log('Blob uploaded successfully:', url)
    return url
  } catch (error) {
    console.error('Error uploading blob:', error)
    throw error
  }
}
