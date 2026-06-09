import type { Payload } from 'payload'

export const seedScentQuiz = async (payload: Payload): Promise<void> => {
  payload.logger.info('Seeding Scent Profiles and Quiz...')

  // 1. Create Scent Profiles
  const profiles = [
    {
      name: 'Coastal & Airy',
      slug: 'coastal',
      tagline: 'Gathered from the tide. A practice in coastal stillness.',
      notes: 'Sea Breeze · Driftwood · Salt Air',
      editorial:
        'Your ritual is one of expansion and clarity. You seek the vastness of the horizon and the sharp, clean bite of the Pacific air to clear your path.',
      featuredProduct: 23, // seashell-garden-glow
      ambientImage: 53,
    },
    {
      name: 'Fresh & Botanical',
      slug: 'fresh',
      tagline: 'Sunlight through wildflowers. A ritual of spring emergence.',
      notes: 'Fresh Green · Lily of the Valley · Morning Dew',
      editorial:
        'You are drawn to the vibrant energy of growth. Your space is a sanctuary for new beginnings, filled with the sun-drenched scent of a meadow in bloom.',
      featuredProduct: 22, // meadowlight-botanical
      ambientImage: 54,
    },
    {
      name: 'Moody & Intimate',
      slug: 'moody',
      tagline: 'Dusk in the sensory revolution. A deeper, more intimate practice.',
      notes: 'Dark Berry · Merlot · Vetiver',
      editorial:
        'You embrace the shadows and the depth of the evening. Your ritual is intimate and layered, seeking the complex notes of dark fruit and ancient woods.',
      featuredProduct: 24, // crimson-noir
      ambientImage: 55,
    },
    {
      name: 'Romantic & Soft',
      slug: 'romantic',
      tagline: 'A garden in full bloom. Radiating elegance and ritual serenity.',
      notes: 'White Lilac · Blue Hydrangea · Soft Musk',
      editorial:
        'You find beauty in tenderness and tradition. Your ritual is an act of elegance, surrounding yourself with the soft, luminous fragrance of a garden at dusk.',
      featuredProduct: 25, // ever-after-glow
      ambientImage: 56,
    },
    {
      name: 'Gentle & Contemplative',
      slug: 'contemplative',
      tagline: 'The quiet beauty of pansies. A contemplative botanical study.',
      notes: 'Lilac · Pressed Pansy · Soft Powder',
      editorial:
        'Your practice is one of stillness and introspection. You seek the gentle, powdered scents that invite quiet thought and the slow passage of time.',
      featuredProduct: 26, // anyas-eyes
      ambientImage: 57,
    },
    {
      name: 'Bold & Floral',
      slug: 'bold',
      tagline: 'Botanical architecture. Bold florals grounded in ritual.',
      notes: 'Fresh Florals · Botanical Rose · Green Stem',
      editorial:
        'You are moved by the architectural power of nature. Your ritual is confident and striking, centered around the heady, unyielding blooms of the botanical world.',
      featuredProduct: 27, // scarlet-bloom
      ambientImage: 58,
    },
  ]

  const profileDocs: Record<string, string | number> = {}

  for (const profile of profiles) {
    const doc = await payload.create({
      collection: 'scent-profiles',
      data: profile,
    })
    profileDocs[profile.slug] = doc.id
  }

  // 2. Create the Quiz
  await payload.create({
    collection: 'quizzes',
    data: {
      title: 'Candera Scent Ritual Quiz',
      questions: [
        {
          prompt: 'When does your ritual most often unfold?',
          options: [
            {
              label: 'Morning light, before the day begins',
              scores: [
                { profile: profileDocs['fresh'] as unknown as number, points: 2 },
                { profile: profileDocs['coastal'] as unknown as number, points: 1 },
              ],
            },
            {
              label: 'The slow afternoon, between tasks',
              scores: [
                { profile: profileDocs['contemplative'] as unknown as number, points: 2 },
                { profile: profileDocs['romantic'] as unknown as number, points: 1 },
              ],
            },
            {
              label: 'Evening, as the world quiets',
              scores: [
                { profile: profileDocs['moody'] as unknown as number, points: 2 },
                { profile: profileDocs['romantic'] as unknown as number, points: 1 },
              ],
            },
            {
              label: 'Late night, in the dark hours',
              scores: [
                { profile: profileDocs['moody'] as unknown as number, points: 2 },
                { profile: profileDocs['bold'] as unknown as number, points: 1 },
              ],
            },
          ],
        },
        {
          prompt: 'Where does your mind wander when the room is quiet?',
          options: [
            {
              label: 'The coast — open air, salt, and distance',
              scores: [{ profile: profileDocs['coastal'] as unknown as number, points: 3 }],
            },
            {
              label: 'A wildflower meadow in full sun',
              scores: [{ profile: profileDocs['fresh'] as unknown as number, points: 3 }],
            },
            {
              label: 'A darkened library, candlelit and still',
              scores: [{ profile: profileDocs['moody'] as unknown as number, points: 3 }],
            },
            {
              label: 'A garden in soft, morning bloom',
              scores: [
                { profile: profileDocs['romantic'] as unknown as number, points: 2 },
                { profile: profileDocs['contemplative'] as unknown as number, points: 1 },
              ],
            },
            {
              label: 'A quiet woodland path in late autumn',
              scores: [{ profile: profileDocs['contemplative'] as unknown as number, points: 3 }],
            },
            {
              label: 'A hothouse full of architectural florals',
              scores: [{ profile: profileDocs['bold'] as unknown as number, points: 3 }],
            },
          ],
        },
        {
          prompt: 'How do you want the air in your room to feel?',
          options: [
            {
              label: 'Clear and expansive, like an open window',
              scores: [
                { profile: profileDocs['coastal'] as unknown as number, points: 2 },
                { profile: profileDocs['fresh'] as unknown as number, points: 1 },
              ],
            },
            {
              label: 'Soft and still, inviting deep breaths',
              scores: [
                { profile: profileDocs['contemplative'] as unknown as number, points: 2 },
                { profile: profileDocs['romantic'] as unknown as number, points: 1 },
              ],
            },
            {
              label: 'Deep and intriguing, a layer of shadow',
              scores: [
                { profile: profileDocs['moody'] as unknown as number, points: 2 },
                { profile: profileDocs['bold'] as unknown as number, points: 1 },
              ],
            },
            {
              label: 'Tender and luminous, like a shared secret',
              scores: [
                { profile: profileDocs['romantic'] as unknown as number, points: 2 },
                { profile: profileDocs['contemplative'] as unknown as number, points: 1 },
              ],
            },
          ],
        },
        {
          prompt: 'Which sensory memory lingers the longest?',
          options: [
            {
              label: 'The bite of salt air and green stems',
              scores: [{ profile: profileDocs['coastal'] as unknown as number, points: 3 }],
            },
            {
              label: 'Sun-warmed herbs and wild botanicals',
              scores: [{ profile: profileDocs['fresh'] as unknown as number, points: 3 }],
            },
            {
              label: 'Dark fruit, aged wood, and velvet',
              scores: [{ profile: profileDocs['moody'] as unknown as number, points: 3 }],
            },
            {
              label: 'Powdered petals and soft, elegant musk',
              scores: [
                { profile: profileDocs['romantic'] as unknown as number, points: 2 },
                { profile: profileDocs['contemplative'] as unknown as number, points: 1 },
              ],
            },
            {
              label: 'Bold, heady blooms grounded in earth',
              scores: [{ profile: profileDocs['bold'] as unknown as number, points: 3 }],
            },
          ],
        },
      ],
    },
  })

  payload.logger.info('Scent Profiles and Quiz seeded successfully.')
}
