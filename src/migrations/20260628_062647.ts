import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "search" ADD COLUMN "tagline" varchar;
  ALTER TABLE "search" ADD COLUMN "product_type" varchar;
  ALTER TABLE "search" ADD COLUMN "price" numeric;
  CREATE INDEX "search_tagline_idx" ON "search" USING btree ("tagline");
  CREATE INDEX "search_product_type_idx" ON "search" USING btree ("product_type");
  CREATE INDEX "search_price_idx" ON "search" USING btree ("price");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "search_tagline_idx";
  DROP INDEX "search_product_type_idx";
  DROP INDEX "search_price_idx";
  ALTER TABLE "search" DROP COLUMN "tagline";
  ALTER TABLE "search" DROP COLUMN "product_type";
  ALTER TABLE "search" DROP COLUMN "price";`)
}
