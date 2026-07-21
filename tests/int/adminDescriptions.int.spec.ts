import { describe, expect, it } from 'vite-plus/test'

import { Pages } from '@/collections/Pages'
import { Posts } from '@/collections/Posts'
import { Products } from '@/collections/Products'
import { Events } from '@/collections/Events'
import { HowToGuides } from '@/collections/HowToGuides'
import { Categories } from '@/collections/Categories'
import { Media } from '@/collections/Media'
import { Quizzes } from '@/collections/Quizzes'
import { ScentProfiles } from '@/collections/ScentProfiles'
import { Briefs } from '@/collections/Briefs'
import { Documentation } from '@/collections/Documentation'
import { Folders } from '@/collections/Folders'
import { EtsyTokens } from '@/collections/EtsyTokens'
import { Users } from '@/collections/Users'
import { Header } from '@/Header/config'
import { Footer } from '@/Footer/config'

const collectionsRequiringDescription = [
  { name: 'Pages', config: Pages },
  { name: 'Posts', config: Posts },
  { name: 'Products', config: Products },
  { name: 'Events', config: Events },
  { name: 'HowToGuides', config: HowToGuides },
  { name: 'Categories', config: Categories },
  { name: 'Media', config: Media },
  { name: 'Quizzes', config: Quizzes },
  { name: 'ScentProfiles', config: ScentProfiles },
  { name: 'Briefs', config: Briefs },
  { name: 'Documentation', config: Documentation },
  { name: 'Folders', config: Folders },
  { name: 'EtsyTokens', config: EtsyTokens },
  { name: 'Users', config: Users },
]

describe('collection admin descriptions', () => {
  it.each(collectionsRequiringDescription)(
    '$name has a non-empty admin.description',
    ({ config }) => {
      expect(typeof config.admin?.description).toBe('string')
      expect((config.admin?.description as string).length).toBeGreaterThan(0)
    },
  )
})

describe('Media collection grouping', () => {
  it('is grouped under Content, not System', () => {
    expect(Media.admin?.group).toBe('Content')
  })
})

describe('Header and Footer global admin config', () => {
  it.each([
    ['Header', Header],
    ['Footer', Footer],
  ])('%s has a Layout group and a non-empty description', (_name, config) => {
    expect(config.admin?.group).toBe('Layout')
    expect(typeof config.admin?.description).toBe('string')
    expect((config.admin?.description as string).length).toBeGreaterThan(0)
  })
})
