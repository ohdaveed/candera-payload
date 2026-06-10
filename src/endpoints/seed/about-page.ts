import type { Media } from '@/payload-types'
import { RequiredDataFromCollectionSlug } from 'payload'
import { createRichText, createHeading, createParagraph } from '@/utilities/lexicalHelpers'

type AboutArgs = {
  aboutImage: Media
}

export const about: (args: AboutArgs) => RequiredDataFromCollectionSlug<'pages'> = ({
  aboutImage,
}) => {
  return {
    slug: 'about',
    _status: 'published',
    hero: {
      type: 'lowImpact',
      richText: createRichText([
        createHeading('The Heart of the Studio.', 'h1'),
        createParagraph(
          'Candera is born from a desire for stillness, craftsmanship, and the botanical poetry of nature.',
        ),
      ]),
    },
    layout: [
      {
        blockType: 'mediaBlock',
        media: aboutImage.id,
      },
      {
        blockType: 'content',
        columns: [
          {
            size: 'full',
            richText: createRichText([
              createHeading('About Candera Candles', 'h2'),
              createParagraph(
                'Candera Candles was born from a simple belief: beauty has the power to transform a space, a moment, and even the way we feel.',
              ),
              createParagraph(
                'Every candle is thoughtfully handcrafted using natural waxes and real botanicals, creating miniature gardens preserved in wax. Inspired by nature, seasons, folklore, and the quiet rituals that bring comfort to everyday life, each piece is designed to be more than a candle—it is an experience.',
              ),
              createParagraph(
                'The flowers, herbs, branches, and natural elements found within every Candera candle are carefully selected and arranged by hand. No two candles are ever exactly alike, making each one a unique work of botanical art.',
              ),
              createParagraph(
                'At Candera, we embrace the beauty of imperfect things: a flower shaped by the wind, a branch that grew in its own direction, a shell marked by the sea. These natural details remind us that life’s most meaningful moments are rarely perfect—they are simply real.',
              ),
              createParagraph(
                'Our candles are created for those who seek warmth, beauty, calm, and connection. Whether lighting a candle after a long day, sharing one as a meaningful gift, or creating a quiet ritual for yourself, Candera exists to bring a little more light, comfort, and intention into your home.',
              ),
            ]),
          },
        ],
      },
      {
        blockType: 'content',
        columns: [
          {
            size: 'full',
            richText: createRichText([
              createHeading('Meet the Maker', 'h2'),
              createParagraph('Hi, I’m Olesia, the founder and maker behind Candera Candles.'),
              createParagraph(
                'My journey to creating Candera began with a deep appreciation for nature and the simple moments that help us slow down. As a first-generation immigrant, wife, dog mom, nature lover, and someone who spent years building a career in public service, I often found myself searching for small moments of peace in a busy world.',
              ),
              createParagraph(
                'I discovered that some of those moments came from the warm glow of a candle, the beauty of flowers, the scent of nature, and the feeling of creating something with my own hands.',
              ),
              createParagraph('What started as a creative outlet quickly became a passion.'),
              createParagraph(
                'Today, every Candera candle is still designed, poured, decorated, and finished by hand. I spend countless hours preserving flowers, arranging botanicals, testing fragrances, and perfecting each candle so that every piece feels special from the moment it reaches its new home.',
              ),
              createParagraph(
                'Candera reflects the things I value most: nature, authenticity, craftsmanship, warmth, and finding beauty in ordinary moments.',
              ),
              createParagraph(
                'My hope is that when you light one of my candles, you feel more than fragrance. I hope you feel comfort. I hope you feel present. I hope you create a moment that belongs entirely to you.',
              ),
              createParagraph(
                'Thank you for allowing my creations to become part of your home and your story.',
              ),
              createParagraph('With love,'),
              createParagraph('Olesia'),
              createParagraph('Founder, Candera Candles'),
            ]),
          },
        ],
      },
    ],
    title: 'About',
  }
}
