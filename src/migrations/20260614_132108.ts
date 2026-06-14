import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_currency" AS ENUM('USD', 'CAD', 'EUR', 'GBP');
  CREATE TYPE "public"."enum__products_v_version_currency" AS ENUM('USD', 'CAD', 'EUR', 'GBP');
  CREATE TYPE "public"."enum_site_theme_hero_layout" AS ENUM('centered-editorial', 'split-atelier', 'cinematic-noir');
  CREATE TYPE "public"."enum_site_theme_product_card_density" AS ENUM('gallery', 'boutique-grid', 'compact');
  CREATE TYPE "public"."enum_site_theme_section_mood" AS ENUM('light-editorial', 'rose-wash', 'noir-contrast');
  CREATE TYPE "public"."enum_site_theme_cta_style" AS ENUM('minimal-outline', 'conversion-filled', 'couture-glow');
  CREATE TABLE "_briefs_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar NOT NULL,
  	"version_content" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "site_theme" ALTER COLUMN "color_scheme" SET DATA TYPE text;
  ALTER TABLE "site_theme" ALTER COLUMN "color_scheme" SET DEFAULT 'rose-conversion'::text;
  DROP TYPE "public"."enum_site_theme_color_scheme";
  CREATE TYPE "public"."enum_site_theme_color_scheme" AS ENUM('rose-conversion', 'black-gold-rose', 'amethyst-amber', 'ink-orchid-coral', 'plum-sage-coral', 'lavender-trust-rose', 'ink-orchid', 'lavender-noir', 'porcelain-pop', 'default');
  ALTER TABLE "site_theme" ALTER COLUMN "color_scheme" SET DEFAULT 'rose-conversion'::"public"."enum_site_theme_color_scheme";
  ALTER TABLE "site_theme" ALTER COLUMN "color_scheme" SET DATA TYPE "public"."enum_site_theme_color_scheme" USING "color_scheme"::"public"."enum_site_theme_color_scheme";
  ALTER TABLE "media" ALTER COLUMN "alt" SET NOT NULL;
  ALTER TABLE "site_theme" ALTER COLUMN "font_set" SET DEFAULT 'playfair-inter';
  ALTER TABLE "products" ADD COLUMN "currency" "enum_products_currency" DEFAULT 'USD';
  ALTER TABLE "products" ADD COLUMN "price_synced_at" timestamp(3) with time zone;
  ALTER TABLE "_products_v" ADD COLUMN "version_currency" "enum__products_v_version_currency" DEFAULT 'USD';
  ALTER TABLE "_products_v" ADD COLUMN "version_price_synced_at" timestamp(3) with time zone;
  ALTER TABLE "site_theme" ALTER COLUMN "hero_layout" DROP DEFAULT;
  ALTER TABLE "site_theme" ALTER COLUMN "hero_layout" SET DATA TYPE "public"."enum_site_theme_hero_layout" USING "hero_layout"::text::"public"."enum_site_theme_hero_layout";
  ALTER TABLE "site_theme" ALTER COLUMN "hero_layout" SET DEFAULT 'centered-editorial'::"public"."enum_site_theme_hero_layout";
  ALTER TABLE "site_theme" ALTER COLUMN "product_card_density" DROP DEFAULT;
  ALTER TABLE "site_theme" ALTER COLUMN "product_card_density" SET DATA TYPE "public"."enum_site_theme_product_card_density" USING "product_card_density"::text::"public"."enum_site_theme_product_card_density";
  ALTER TABLE "site_theme" ALTER COLUMN "product_card_density" SET DEFAULT 'boutique-grid'::"public"."enum_site_theme_product_card_density";
  ALTER TABLE "site_theme" ALTER COLUMN "section_mood" DROP DEFAULT;
  ALTER TABLE "site_theme" ALTER COLUMN "section_mood" SET DATA TYPE "public"."enum_site_theme_section_mood" USING "section_mood"::text::"public"."enum_site_theme_section_mood";
  ALTER TABLE "site_theme" ALTER COLUMN "section_mood" SET DEFAULT 'light-editorial'::"public"."enum_site_theme_section_mood";
  ALTER TABLE "site_theme" ALTER COLUMN "cta_style" DROP DEFAULT;
  ALTER TABLE "site_theme" ALTER COLUMN "cta_style" SET DATA TYPE "public"."enum_site_theme_cta_style" USING "cta_style"::text::"public"."enum_site_theme_cta_style";
  ALTER TABLE "site_theme" ALTER COLUMN "cta_style" SET DEFAULT 'conversion-filled'::"public"."enum_site_theme_cta_style";
  ALTER TABLE "_briefs_v" ADD CONSTRAINT "_briefs_v_parent_id_briefs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."briefs"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "_briefs_v_parent_idx" ON "_briefs_v" USING btree ("parent_id");
  CREATE INDEX "_briefs_v_version_version_updated_at_idx" ON "_briefs_v" USING btree ("version_updated_at");
  CREATE INDEX "_briefs_v_version_version_created_at_idx" ON "_briefs_v" USING btree ("version_created_at");
  CREATE INDEX "_briefs_v_created_at_idx" ON "_briefs_v" USING btree ("created_at");
  CREATE INDEX "_briefs_v_updated_at_idx" ON "_briefs_v" USING btree ("updated_at");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_briefs_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "_briefs_v" CASCADE;
  ALTER TABLE "site_theme" ALTER COLUMN "color_scheme" SET DATA TYPE text;
  ALTER TABLE "site_theme" ALTER COLUMN "color_scheme" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum_site_theme_color_scheme";
  CREATE TYPE "public"."enum_site_theme_color_scheme" AS ENUM('default', 'ink-orchid', 'lavender-noir', 'porcelain-pop');
  ALTER TABLE "site_theme" ALTER COLUMN "color_scheme" SET DEFAULT 'default'::"public"."enum_site_theme_color_scheme";
  ALTER TABLE "site_theme" ALTER COLUMN "color_scheme" SET DATA TYPE "public"."enum_site_theme_color_scheme" USING "color_scheme"::"public"."enum_site_theme_color_scheme";
  ALTER TABLE "media" ALTER COLUMN "alt" DROP NOT NULL;
  ALTER TABLE "site_theme" ALTER COLUMN "font_set" SET DEFAULT 'default';
  ALTER TABLE "products" DROP COLUMN "currency";
  ALTER TABLE "products" DROP COLUMN "price_synced_at";
  ALTER TABLE "_products_v" DROP COLUMN "version_currency";
  ALTER TABLE "_products_v" DROP COLUMN "version_price_synced_at";
  ALTER TABLE "site_theme" DROP COLUMN "hero_layout";
  ALTER TABLE "site_theme" DROP COLUMN "product_card_density";
  ALTER TABLE "site_theme" DROP COLUMN "section_mood";
  ALTER TABLE "site_theme" DROP COLUMN "cta_style";
  DROP TYPE "public"."enum_products_currency";
  DROP TYPE "public"."enum__products_v_version_currency";
  DROP TYPE "public"."enum_site_theme_hero_layout";
  DROP TYPE "public"."enum_site_theme_product_card_density";
  DROP TYPE "public"."enum_site_theme_section_mood";
  DROP TYPE "public"."enum_site_theme_cta_style";`)
}
