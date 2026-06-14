import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { MediaBlock as MediaBlockProps } from '@/payload-types'

import { Media } from '../../components/Media'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'

type Props = MediaBlockProps & {
  captionClassName?: string
  className?: string
  enableGutter?: boolean
  imgClassName?: string
  staticImage?: StaticImageData
  disableInnerContainer?: boolean
}

export const MediaBlock: React.FC<Props> = (props) => {
  const {
    captionClassName,
    className,
    enableGutter = true,
    imgClassName,
    media,
    staticImage,
    disableInnerContainer,
  } = props

  let caption
  if (media && typeof media === 'object') caption = media.caption

  return (
    <Section padding="medium" className={cn('overflow-hidden', className)}>
      <Container className={cn({ 'px-0 md:px-0 max-w-none': !enableGutter })}>
        <figure className="m-0 group flex flex-col items-center">
          {(media || staticImage) && (
            <Media
              className="w-full"
              htmlElement="span"
              imgClassName={cn(
                'border border-candera-stone/30 rounded-none transition-all duration-1000 ease-candera-enter',
                imgClassName,
              )}
              resource={media}
              src={staticImage}
            />
          )}
          {caption && (
            <figcaption
              className={cn(
                'mt-12 max-w-[700px] mx-auto text-center editorial italic text-candera-sage-text leading-relaxed',
                {
                  container: !disableInnerContainer,
                },
                captionClassName,
              )}
            >
              <span
                className="block h-px w-12 mx-auto mb-8 bg-candera-stone/40"
                aria-hidden="true"
              />
              <RichText data={caption} enableGutter={false} />
            </figcaption>
          )}
        </figure>
      </Container>
    </Section>
  )
}
