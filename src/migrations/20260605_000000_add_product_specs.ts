import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products"
      ADD COLUMN IF NOT EXISTS "price" numeric,
      ADD COLUMN IF NOT EXISTS "size" varchar,
      ADD COLUMN IF NOT EXISTS "wax_blend" varchar,
      ADD COLUMN IF NOT EXISTS "craftsmanship" varchar,
      ADD COLUMN IF NOT EXISTS "origin" varchar,
      ADD COLUMN IF NOT EXISTS "fragrance_notes_top" varchar,
      ADD COLUMN IF NOT EXISTS "fragrance_notes_heart" varchar,
      ADD COLUMN IF NOT EXISTS "fragrance_notes_base" varchar,
      ADD COLUMN IF NOT EXISTS "burn_time" varchar,
      ADD COLUMN IF NOT EXISTS "atmosphere" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products"
      DROP COLUMN IF EXISTS "price",
      DROP COLUMN IF EXISTS "size",
      DROP COLUMN IF EXISTS "wax_blend",
      DROP COLUMN IF EXISTS "craftsmanship",
      DROP COLUMN IF EXISTS "origin",
      DROP COLUMN IF EXISTS "fragrance_notes_top",
      DROP COLUMN IF EXISTS "fragrance_notes_heart",
      DROP COLUMN IF EXISTS "fragrance_notes_base",
      DROP COLUMN IF EXISTS "burn_time",
      DROP COLUMN IF EXISTS "atmosphere";
  `)
}
