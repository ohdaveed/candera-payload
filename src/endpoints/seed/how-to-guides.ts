import type { RequiredDataFromCollectionSlug } from 'payload'
import type { Media } from '@/payload-types'
import {
  createBulletList,
  createHeading,
  createParagraph,
  createRichText,
} from '@/utilities/lexicalHelpers'

type HowToGuide = RequiredDataFromCollectionSlug<'how-to-guides'>

export const candleCare101 = ({ heroImage }: { heroImage: Media }): HowToGuide => ({
  title: 'Candle Care 101',
  slug: 'candle-care-101',
  _status: 'draft',
  heroImage: heroImage.id,
  publishedAt: new Date('2026-06-22').toISOString(),
  content: createRichText([
    createHeading('Trim Your Wick Before Every Burn', 'h2'),
    createParagraph(
      'Before lighting your Candera candle, trim the wick to approximately 5mm (¼ inch). A long wick produces a larger, unsteady flame that generates excess soot and burns through your wax too quickly. A sharp pair of wick trimmers — or clean nail scissors — makes this a ten-second ritual.',
    ),
    createHeading('The First Burn Sets the Memory', 'h2'),
    createParagraph(
      "Soy and coconut wax has a cellular memory. On the first burn, allow the melt pool to reach the edges of the vessel before extinguishing — typically 2–3 hours for an 8 oz candle. If you cut the first burn short, the wax will tunnel down the centre and you will lose up to 30% of the fragrance throw for the candle's lifetime.",
    ),
    createHeading('Burn Time Guidelines', 'h2'),
    createParagraph(
      'Each Candera candle is rated for 60 hours of burn time. To protect the vessel and maximise scent, burn for no longer than 4 hours at a time. Allow the wax to fully solidify and cool (at least 2 hours) before relighting.',
    ),
    createHeading('Avoid Draughts', 'h2'),
    createParagraph(
      "Candles should be burned in a still room, away from open windows, fans, and air vents. Moving air causes an uneven burn, excess smoke, and premature wax consumption. If you notice your flame flickering consistently, it's not in the right spot.",
    ),
    createHeading('Store Out of Direct Light', 'h2'),
    createParagraph(
      'Natural wax and botanical fragrance oils are sensitive to UV light and heat. Store unlit candles away from direct sunlight, and replace the lid between burns to protect the wax surface and preserve the scent throw.',
    ),
    createHeading('Quick Reference', 'h2'),
    createBulletList(
      'Trim wick to ¼ inch (5mm) before every burn',
      'First burn: allow full edge-to-edge melt pool (2–3 hours)',
      'Maximum burn session: 4 hours',
      'Minimum rest between burns: 2 hours',
      'Store away from sunlight and heat with lid on',
    ),
  ]) as HowToGuide['content'],
  meta: {
    title: 'Candle Care 101 | Candera',
    description:
      'How to trim wicks, set wax memory, and store your Candera candle for a clean, long-lasting burn.',
  },
})

export const firstBurnRitual = ({ heroImage }: { heroImage: Media }): HowToGuide => ({
  title: 'The First Burn Ritual',
  slug: 'the-first-burn-ritual',
  _status: 'draft',
  heroImage: heroImage.id,
  publishedAt: new Date('2026-06-22').toISOString(),
  content: createRichText([
    createHeading('Why the First Burn Matters', 'h2'),
    createParagraph(
      'The first burn of any candle is the most important. Soy and coconut wax — the blend we use at Candera — has what candlemakers call "wax memory." This means it will follow the exact melt pattern established during the first burn for every subsequent lighting. A tunnel formed on day one is a tunnel you live with forever.',
    ),
    createHeading('Setting the Wax Memory', 'h2'),
    createParagraph(
      "Choose a moment when you have at least two to three uninterrupted hours. Clear your space. Light the candle and allow it to burn until the melt pool — the liquid layer of wax — reaches the full diameter of the vessel. This is typically 2–3 hours depending on the candle's width.",
    ),
    createParagraph(
      'Resist the temptation to extinguish early. The full-diameter melt pool ensures the wax will burn evenly in every future session.',
    ),
    createHeading('What You Will Notice', 'h2'),
    createParagraph(
      'During the first burn you may notice a faint "cold throw" — scent released by the wax even without heat. As the fragrance oil heats, the "hot throw" will intensify and fill the room. The most complex fragrance layers — the heart and base notes — emerge after about 30 minutes of burning.',
    ),
    createHeading('Extinguishing Properly', 'h2'),
    createParagraph(
      'Use a candle snuffer rather than blowing out the flame. Blowing forces unburnt wax particles and wick debris into the air and onto the wax surface. A snuffer cuts off oxygen cleanly, preserving the scent throw for next time. If you do not have a snuffer, hold the lid over the flame for a few seconds.',
    ),
    createHeading('After the First Burn', 'h2'),
    createParagraph(
      'Once the wax has fully re-solidified (allow at least 2 hours), trim the wick to ¼ inch. The wax memory is now set — every subsequent burn will follow the same even, edge-to-edge pattern.',
    ),
  ]) as HowToGuide['content'],
  meta: {
    title: 'The First Burn Ritual | Candera',
    description:
      "Why the first burn determines every burn: how to set your Candera candle's wax memory for a perfect lifetime of scent.",
  },
})

export const readingScentProfile = ({ heroImage }: { heroImage: Media }): HowToGuide => ({
  title: 'Reading Your Scent Profile',
  slug: 'reading-your-scent-profile',
  _status: 'draft',
  heroImage: heroImage.id,
  publishedAt: new Date('2026-06-22').toISOString(),
  content: createRichText([
    createHeading('The Architecture of Fragrance', 'h2'),
    createParagraph(
      'Every Candera candle is built on the classical perfumery model of top, heart, and base notes. Understanding this structure helps you choose a candle that suits your space and mood — and know what to expect as the burn progresses.',
    ),
    createHeading('Top Notes', 'h2'),
    createParagraph(
      'Top notes are the first impression — bright, volatile molecules that evaporate quickly within the first 10–15 minutes of burning. Citrus, herbs, and fresh greens live here. They are what you smell when you first light the candle or test a cold candle in-store.',
    ),
    createParagraph(
      "If you love a candle's opening act but the dry-down feels wrong, look for one with heart and base notes that better match your preference — the top notes will always fade.",
    ),
    createHeading('Heart Notes', 'h2'),
    createParagraph(
      'Heart notes emerge after 15–30 minutes of burning, once the top notes have lifted. They form the core character of the candle — the part you live with longest. Florals, spices, and light woods typically anchor the heart. When Candera lists notes like "Botanical Rose" or "Pressed Pansy," these are heart-layer descriptors.',
    ),
    createHeading('Base Notes', 'h2'),
    createParagraph(
      'Base notes provide depth, longevity, and the scent that lingers on soft furnishings long after the candle is extinguished. They are the slowest to evaporate — heavy molecules like musks, vetiver, amber, and woods. A rich base is the difference between a candle that smells pleasant and one that feels anchoring.',
    ),
    createHeading('Reading the Atmosphere Tag', 'h2'),
    createParagraph(
      'On each Candera product page you will find an "Atmosphere" tag — Coastal, Moody, Romantic, Fresh, Contemplative, Bold. These are editorial guides based on the full scent arc, not just the top note. If you find a top note compelling but the atmosphere doesn\'t match your space, trust the atmosphere first.',
    ),
    createHeading('Cold Throw vs. Hot Throw', 'h2'),
    createParagraph(
      'The cold throw is the scent you detect from an unlit candle. The hot throw is the scent released by burning wax. They can differ significantly. Some fragrances are subtle unlit but powerful when burning; others are heady on cold test but gentle in a room. Trust the hot throw as your true guide — it is what you will live with.',
    ),
  ]) as HowToGuide['content'],
  meta: {
    title: 'Reading Your Scent Profile | Candera',
    description:
      'A guide to top, heart, and base notes — and how to use the Candera scent profile to choose the right candle for your space.',
  },
})

export const seedHowToGuides = async (
  payload: import('payload').Payload,
  { image1Doc, image2Doc, image3Doc }: { image1Doc: Media; image2Doc: Media; image3Doc: Media },
): Promise<void> => {
  payload.logger.info('— Seeding how-to guides...')

  await payload.create({
    collection: 'how-to-guides',
    depth: 0,
    context: { disableRevalidate: true },
    data: candleCare101({ heroImage: image1Doc }),
  })

  await payload.create({
    collection: 'how-to-guides',
    depth: 0,
    context: { disableRevalidate: true },
    data: firstBurnRitual({ heroImage: image2Doc }),
  })

  await payload.create({
    collection: 'how-to-guides',
    depth: 0,
    context: { disableRevalidate: true },
    data: readingScentProfile({ heroImage: image3Doc }),
  })
}
