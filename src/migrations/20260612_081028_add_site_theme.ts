import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_theme_color_scheme" AS ENUM('default', 'ink-orchid', 'lavender-noir', 'porcelain-pop');
  CREATE TYPE "public"."enum_site_theme_font_set" AS ENUM('default', 'playfair-inter', 'dm-sans', 'space-grotesk');
  CREATE TABLE "site_theme" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"color_scheme" "enum_site_theme_color_scheme" DEFAULT 'default' NOT NULL,
  	"font_set" "enum_site_theme_font_set" DEFAULT 'default' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_theme" CASCADE;
  DROP TYPE "public"."enum_site_theme_color_scheme";
  DROP TYPE "public"."enum_site_theme_font_set";`)
}
