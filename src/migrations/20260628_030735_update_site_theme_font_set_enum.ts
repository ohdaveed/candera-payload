import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_theme" ALTER COLUMN "font_set" SET DATA TYPE text;
  ALTER TABLE "site_theme" ALTER COLUMN "font_set" SET DEFAULT 'default'::text;
  UPDATE "site_theme" SET "font_set" = 'default' WHERE "font_set" NOT IN ('default', 'dm-sans');
  DROP TYPE "public"."enum_site_theme_font_set";
  CREATE TYPE "public"."enum_site_theme_font_set" AS ENUM('default', 'dm-sans');
  ALTER TABLE "site_theme" ALTER COLUMN "font_set" SET DEFAULT 'default'::"public"."enum_site_theme_font_set";
  ALTER TABLE "site_theme" ALTER COLUMN "font_set" SET DATA TYPE "public"."enum_site_theme_font_set" USING "font_set"::"public"."enum_site_theme_font_set";`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_site_theme_font_set" ADD VALUE 'playfair-inter' BEFORE 'dm-sans';
  ALTER TYPE "public"."enum_site_theme_font_set" ADD VALUE 'space-grotesk';
  ALTER TABLE "site_theme" ALTER COLUMN "font_set" SET DEFAULT 'playfair-inter';`)
}
