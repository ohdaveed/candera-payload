import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { MediaBlock as MediaBlockProps } from '@/payload-types'

import { Media } from '../../components/Media'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'

type Props = MediaBlockProps & {
  breakout?: boolean
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
    <Section padding="large" className={cn(className)}>
      <Container className={cn({ 'px-0 md:px-0 max-w-none': !enableGutter })}>
        <figure className="m-0">
          {(media || staticImage) && (
            <Media
              imgClassName={cn(
                'border border-border rounded-none grayscale hover:grayscale-0 transition-all duration-1000',
                imgClassName,
              )}
              resource={media}
              src={staticImage}
            />
          )}
          {caption && (
            <figcaption
              className={cn(
                'mt-8 max-w-[800px] mx-auto text-center editorial italic text-candera-sage-text',
                {
                  container: !disableInnerContainer,
                },
                captionClassName,
              )}
            >
              <RichText data={caption} enableGutter={false} />
            </figcaption>
          )}
        </figure>
      </Container>
    </Section>
  )
}
