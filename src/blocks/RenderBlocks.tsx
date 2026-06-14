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
const FormBlock = dynamic(() => import('@/blocks/Form/Component').then((m) => m.FormBlock), {
  ssr: true,
})

import { ScentQuizClientBlock as ScentQuizModal } from '@/blocks/ScentQuiz/ClientBlock'
import { ScentQuizCTABand } from '@/blocks/ScentQuiz/CTABand'

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

  const fullBleedBlocks = new Set(['storefrontHero', 'testimonials', 'innerCircleCTA', 'scentQuiz'])

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              // scentQuiz: render CTA band above the modal portal
              if (blockType === 'scentQuiz') {
                const sq = block as unknown as {
                  eyebrow?: string
                  headline?: string
                  body?: string
                }
                return (
                  <Fragment key={index}>
                    <ScentQuizCTABand eyebrow={sq.eyebrow} headline={sq.headline} body={sq.body} />
                    {/* @ts-expect-error there may be some mismatch between the expected types here */}
                    <Block {...block} />
                  </Fragment>
                )
              }

              const isFullBleed = fullBleedBlocks.has(blockType)
              return (
                <div
                  className={isFullBleed ? '' : 'my-16'}
                  id={blockType === 'archive' ? 'collection' : undefined}
                  data-block={blockType}
                  data-block-index={index}
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
