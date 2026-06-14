import React, { Fragment } from 'react'
import dynamic from 'next/dynamic'

import type { Page } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { StorefrontHeroBlock } from '@/blocks/StorefrontHero/Component'
import { TestimonialsBlock } from '@/blocks/Testimonials/Component'
import { InnerCircleCTABlock } from '@/blocks/InnerCircleCTA/Component'
import { ScentQuizModal } from '@/blocks/ScentQuiz/Modal'

const FormBlock = dynamic(() => import('@/blocks/Form/Component').then((m) => m.FormBlock), {
  ssr: true,
})

const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  storefrontHero: StorefrontHeroBlock,
  testimonials: TestimonialsBlock,
  innerCircleCTA: InnerCircleCTABlock,
  scentQuiz: ScentQuizModal,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  const fullBleedBlocks = new Set(['storefrontHero', 'testimonials', 'innerCircleCTA'])

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block
          const previousBlock = index > 0 ? blocks[index - 1] : null
          const followsStorefrontHero = previousBlock?.blockType === 'storefrontHero'

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              // scentQuiz renders as a modal portal — no wrapper div needed
              if (blockType === 'scentQuiz') {
                return (
                  // @ts-expect-error there may be some mismatch between the expected types here
                  <Block key={index} {...block} />
                )
              }

              const isFullBleed = fullBleedBlocks.has(blockType)
              return (
                <div
                  className={[
                    isFullBleed ? '' : 'my-16',
                    followsStorefrontHero ? 'mt-32 md:mt-48' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  id={blockType === 'archive' ? 'collection' : undefined}
                  key={index}
                >
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...block} disableInnerContainer />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
