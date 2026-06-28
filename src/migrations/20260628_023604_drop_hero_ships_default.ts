import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_storefront_hero" ALTER COLUMN "status_card_ships" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_storefront_hero" ALTER COLUMN "status_card_ships" DROP DEFAULT;`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_storefront_hero" ALTER COLUMN "status_card_ships" SET DEFAULT '47 units total';
  ALTER TABLE "_pages_v_blocks_storefront_hero" ALTER COLUMN "status_card_ships" SET DEFAULT '47 units total';`)
}
