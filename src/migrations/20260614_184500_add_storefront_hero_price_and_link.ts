import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_storefront_hero" ALTER COLUMN "status_card_title" SET DEFAULT 'Featured Candle';
  ALTER TABLE "pages_blocks_storefront_hero" ALTER COLUMN "status_card_subtitle" SET DEFAULT 'Wild Lilac (8 oz)';
  ALTER TABLE "pages_blocks_storefront_hero" ALTER COLUMN "status_card_status" SET DEFAULT 'Limited Batch';
  ALTER TABLE "pages_blocks_storefront_hero" ALTER COLUMN "status_card_ships" SET DEFAULT '47 units total';
  ALTER TABLE "_pages_v_blocks_storefront_hero" ALTER COLUMN "status_card_title" SET DEFAULT 'Featured Candle';
  ALTER TABLE "_pages_v_blocks_storefront_hero" ALTER COLUMN "status_card_subtitle" SET DEFAULT 'Wild Lilac (8 oz)';
  ALTER TABLE "_pages_v_blocks_storefront_hero" ALTER COLUMN "status_card_status" SET DEFAULT 'Limited Batch';
  ALTER TABLE "_pages_v_blocks_storefront_hero" ALTER COLUMN "status_card_ships" SET DEFAULT '47 units total';
  ALTER TABLE "pages_blocks_storefront_hero" ADD COLUMN "status_card_price" varchar DEFAULT '$38';
  ALTER TABLE "pages_blocks_storefront_hero" ADD COLUMN "status_card_link_url" varchar DEFAULT '/products/wild-lilac';
  ALTER TABLE "_pages_v_blocks_storefront_hero" ADD COLUMN "status_card_price" varchar DEFAULT '$38';
  ALTER TABLE "_pages_v_blocks_storefront_hero" ADD COLUMN "status_card_link_url" varchar DEFAULT '/products/wild-lilac';`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_storefront_hero" ALTER COLUMN "status_card_title" SET DEFAULT 'Batch 014';
  ALTER TABLE "pages_blocks_storefront_hero" ALTER COLUMN "status_card_subtitle" SET DEFAULT '47 units · hand-poured';
  ALTER TABLE "pages_blocks_storefront_hero" ALTER COLUMN "status_card_status" SET DEFAULT 'Curing';
  ALTER TABLE "pages_blocks_storefront_hero" ALTER COLUMN "status_card_ships" SET DEFAULT '~3 weeks';
  ALTER TABLE "_pages_v_blocks_storefront_hero" ALTER COLUMN "status_card_title" SET DEFAULT 'Batch 014';
  ALTER TABLE "_pages_v_blocks_storefront_hero" ALTER COLUMN "status_card_subtitle" SET DEFAULT '47 units · hand-poured';
  ALTER TABLE "_pages_v_blocks_storefront_hero" ALTER COLUMN "status_card_status" SET DEFAULT 'Curing';
  ALTER TABLE "_pages_v_blocks_storefront_hero" ALTER COLUMN "status_card_ships" SET DEFAULT '~3 weeks';
  ALTER TABLE "pages_blocks_storefront_hero" DROP COLUMN "status_card_price";
  ALTER TABLE "pages_blocks_storefront_hero" DROP COLUMN "status_card_link_url";
  ALTER TABLE "_pages_v_blocks_storefront_hero" DROP COLUMN "status_card_price";
  ALTER TABLE "_pages_v_blocks_storefront_hero" DROP COLUMN "status_card_link_url";`)
}
