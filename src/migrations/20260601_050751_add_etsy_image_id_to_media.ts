import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "media" ADD COLUMN "etsy_image_id" numeric;
  CREATE UNIQUE INDEX "media_etsy_image_id_idx" ON "media" USING btree ("etsy_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP INDEX "media_etsy_image_id_idx";
  ALTER TABLE "media" DROP COLUMN "etsy_image_id";`)
}
