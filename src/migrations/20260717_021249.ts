import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_storefront_hero" DROP COLUMN "status_card_title";
  ALTER TABLE "pages_blocks_storefront_hero" DROP COLUMN "status_card_price";
  ALTER TABLE "pages_blocks_storefront_hero" DROP COLUMN "status_card_subtitle";
  ALTER TABLE "pages_blocks_storefront_hero" DROP COLUMN "status_card_status";
  ALTER TABLE "pages_blocks_storefront_hero" DROP COLUMN "status_card_ships";
  ALTER TABLE "pages_blocks_storefront_hero" DROP COLUMN "status_card_link_url";
  ALTER TABLE "_pages_v_blocks_storefront_hero" DROP COLUMN "status_card_title";
  ALTER TABLE "_pages_v_blocks_storefront_hero" DROP COLUMN "status_card_price";
  ALTER TABLE "_pages_v_blocks_storefront_hero" DROP COLUMN "status_card_subtitle";
  ALTER TABLE "_pages_v_blocks_storefront_hero" DROP COLUMN "status_card_status";
  ALTER TABLE "_pages_v_blocks_storefront_hero" DROP COLUMN "status_card_ships";
  ALTER TABLE "_pages_v_blocks_storefront_hero" DROP COLUMN "status_card_link_url";`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_storefront_hero" ADD COLUMN "status_card_title" varchar DEFAULT 'Featured Candle';
  ALTER TABLE "pages_blocks_storefront_hero" ADD COLUMN "status_card_price" varchar DEFAULT '$38';
  ALTER TABLE "pages_blocks_storefront_hero" ADD COLUMN "status_card_subtitle" varchar DEFAULT 'Wild Lilac (8 oz)';
  ALTER TABLE "pages_blocks_storefront_hero" ADD COLUMN "status_card_status" varchar DEFAULT 'Limited Batch';
  ALTER TABLE "pages_blocks_storefront_hero" ADD COLUMN "status_card_ships" varchar;
  ALTER TABLE "pages_blocks_storefront_hero" ADD COLUMN "status_card_link_url" varchar DEFAULT '/products/wild-lilac';
  ALTER TABLE "_pages_v_blocks_storefront_hero" ADD COLUMN "status_card_title" varchar DEFAULT 'Featured Candle';
  ALTER TABLE "_pages_v_blocks_storefront_hero" ADD COLUMN "status_card_price" varchar DEFAULT '$38';
  ALTER TABLE "_pages_v_blocks_storefront_hero" ADD COLUMN "status_card_subtitle" varchar DEFAULT 'Wild Lilac (8 oz)';
  ALTER TABLE "_pages_v_blocks_storefront_hero" ADD COLUMN "status_card_status" varchar DEFAULT 'Limited Batch';
  ALTER TABLE "_pages_v_blocks_storefront_hero" ADD COLUMN "status_card_ships" varchar;
  ALTER TABLE "_pages_v_blocks_storefront_hero" ADD COLUMN "status_card_link_url" varchar DEFAULT '/products/wild-lilac';`)
}
