import { describe, it, expect } from 'vite-plus/test'
import { createNumberedList } from '@/utilities/lexicalHelpers'

describe('createNumberedList', () => {
  it('builds an ordered Lexical list node', () => {
    const node = createNumberedList('First step', 'Second step')
    expect(node.type).toBe('list')
    expect(node.listType).toBe('number')
    expect(node.tag).toBe('ol')
    expect(node.start).toBe(1)
    expect(node.children).toHaveLength(2)
    expect(node.children[0].value).toBe(1)
    expect(node.children[1].value).toBe(2)
    expect(node.children[0].children[0].text).toBe('First step')
  })
})
