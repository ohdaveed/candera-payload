import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_site_theme_color_scheme" ADD VALUE IF NOT EXISTS 'rose-conversion';
  ALTER TYPE "public"."enum_site_theme_color_scheme" ADD VALUE IF NOT EXISTS 'black-gold-rose';
  ALTER TYPE "public"."enum_site_theme_color_scheme" ADD VALUE IF NOT EXISTS 'amethyst-amber';
  ALTER TYPE "public"."enum_site_theme_color_scheme" ADD VALUE IF NOT EXISTS 'ink-orchid-coral';
  ALTER TYPE "public"."enum_site_theme_color_scheme" ADD VALUE IF NOT EXISTS 'plum-sage-coral';
  ALTER TYPE "public"."enum_site_theme_color_scheme" ADD VALUE IF NOT EXISTS 'lavender-trust-rose';
  ALTER TABLE "site_theme" ADD COLUMN IF NOT EXISTS "hero_layout" varchar DEFAULT 'centered-editorial' NOT NULL;
  ALTER TABLE "site_theme" ADD COLUMN IF NOT EXISTS "product_card_density" varchar DEFAULT 'boutique-grid' NOT NULL;
  ALTER TABLE "site_theme" ADD COLUMN IF NOT EXISTS "section_mood" varchar DEFAULT 'light-editorial' NOT NULL;
  ALTER TABLE "site_theme" ADD COLUMN IF NOT EXISTS "cta_style" varchar DEFAULT 'conversion-filled' NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_theme" DROP COLUMN IF EXISTS "cta_style";
  ALTER TABLE "site_theme" DROP COLUMN IF EXISTS "section_mood";
  ALTER TABLE "site_theme" DROP COLUMN IF EXISTS "product_card_density";
  ALTER TABLE "site_theme" DROP COLUMN IF EXISTS "hero_layout";
  `)
}
