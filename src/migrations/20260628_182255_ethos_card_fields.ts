import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_storefront_hero" ADD COLUMN "ethos_card_eyebrow" varchar DEFAULT 'The Slow Pour';
  ALTER TABLE "pages_blocks_storefront_hero" ADD COLUMN "ethos_card_body" varchar DEFAULT 'No factories. No white labeling. Just real pressed botanicals and slow light.';
  ALTER TABLE "pages_blocks_storefront_hero" ADD COLUMN "ethos_card_footer_label" varchar DEFAULT 'Exclusively on Etsy';
  ALTER TABLE "pages_blocks_storefront_hero" ADD COLUMN "ethos_card_link_label" varchar DEFAULT 'Read Journal';
  ALTER TABLE "_pages_v_blocks_storefront_hero" ADD COLUMN "ethos_card_eyebrow" varchar DEFAULT 'The Slow Pour';
  ALTER TABLE "_pages_v_blocks_storefront_hero" ADD COLUMN "ethos_card_body" varchar DEFAULT 'No factories. No white labeling. Just real pressed botanicals and slow light.';
  ALTER TABLE "_pages_v_blocks_storefront_hero" ADD COLUMN "ethos_card_footer_label" varchar DEFAULT 'Exclusively on Etsy';
  ALTER TABLE "_pages_v_blocks_storefront_hero" ADD COLUMN "ethos_card_link_label" varchar DEFAULT 'Read Journal';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_storefront_hero" DROP COLUMN "ethos_card_eyebrow";
  ALTER TABLE "pages_blocks_storefront_hero" DROP COLUMN "ethos_card_body";
  ALTER TABLE "pages_blocks_storefront_hero" DROP COLUMN "ethos_card_footer_label";
  ALTER TABLE "pages_blocks_storefront_hero" DROP COLUMN "ethos_card_link_label";
  ALTER TABLE "_pages_v_blocks_storefront_hero" DROP COLUMN "ethos_card_eyebrow";
  ALTER TABLE "_pages_v_blocks_storefront_hero" DROP COLUMN "ethos_card_body";
  ALTER TABLE "_pages_v_blocks_storefront_hero" DROP COLUMN "ethos_card_footer_label";
  ALTER TABLE "_pages_v_blocks_storefront_hero" DROP COLUMN "ethos_card_link_label";`)
}
