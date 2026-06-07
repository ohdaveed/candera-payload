import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_storefront_hero" ADD COLUMN "secondary_cta_label" varchar DEFAULT 'Take the Scent Quiz →';
  ALTER TABLE "pages_blocks_storefront_hero" ADD COLUMN "secondary_cta_url" varchar DEFAULT '#scent-quiz';
  ALTER TABLE "pages_blocks_storefront_hero" ADD COLUMN "show_status_card" boolean DEFAULT true;
  ALTER TABLE "pages_blocks_storefront_hero" ADD COLUMN "status_card_title" varchar DEFAULT 'Batch 014';
  ALTER TABLE "pages_blocks_storefront_hero" ADD COLUMN "status_card_subtitle" varchar DEFAULT '47 units · hand-poured';
  ALTER TABLE "pages_blocks_storefront_hero" ADD COLUMN "status_card_status" varchar DEFAULT 'Curing';
  ALTER TABLE "pages_blocks_storefront_hero" ADD COLUMN "status_card_ships" varchar DEFAULT '~3 weeks';
  ALTER TABLE "_pages_v_blocks_storefront_hero" ADD COLUMN "secondary_cta_label" varchar DEFAULT 'Take the Scent Quiz →';
  ALTER TABLE "_pages_v_blocks_storefront_hero" ADD COLUMN "secondary_cta_url" varchar DEFAULT '#scent-quiz';
  ALTER TABLE "_pages_v_blocks_storefront_hero" ADD COLUMN "show_status_card" boolean DEFAULT true;
  ALTER TABLE "_pages_v_blocks_storefront_hero" ADD COLUMN "status_card_title" varchar DEFAULT 'Batch 014';
  ALTER TABLE "_pages_v_blocks_storefront_hero" ADD COLUMN "status_card_subtitle" varchar DEFAULT '47 units · hand-poured';
  ALTER TABLE "_pages_v_blocks_storefront_hero" ADD COLUMN "status_card_status" varchar DEFAULT 'Curing';
  ALTER TABLE "_pages_v_blocks_storefront_hero" ADD COLUMN "status_card_ships" varchar DEFAULT '~3 weeks';`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_storefront_hero" DROP COLUMN "secondary_cta_label";
  ALTER TABLE "pages_blocks_storefront_hero" DROP COLUMN "secondary_cta_url";
  ALTER TABLE "pages_blocks_storefront_hero" DROP COLUMN "show_status_card";
  ALTER TABLE "pages_blocks_storefront_hero" DROP COLUMN "status_card_title";
  ALTER TABLE "pages_blocks_storefront_hero" DROP COLUMN "status_card_subtitle";
  ALTER TABLE "pages_blocks_storefront_hero" DROP COLUMN "status_card_status";
  ALTER TABLE "pages_blocks_storefront_hero" DROP COLUMN "status_card_ships";
  ALTER TABLE "_pages_v_blocks_storefront_hero" DROP COLUMN "secondary_cta_label";
  ALTER TABLE "_pages_v_blocks_storefront_hero" DROP COLUMN "secondary_cta_url";
  ALTER TABLE "_pages_v_blocks_storefront_hero" DROP COLUMN "show_status_card";
  ALTER TABLE "_pages_v_blocks_storefront_hero" DROP COLUMN "status_card_title";
  ALTER TABLE "_pages_v_blocks_storefront_hero" DROP COLUMN "status_card_subtitle";
  ALTER TABLE "_pages_v_blocks_storefront_hero" DROP COLUMN "status_card_status";
  ALTER TABLE "_pages_v_blocks_storefront_hero" DROP COLUMN "status_card_ships";`)
}
