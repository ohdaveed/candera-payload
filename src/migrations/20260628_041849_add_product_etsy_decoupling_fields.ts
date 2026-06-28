import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" ADD COLUMN "etsy_title" varchar;
  ALTER TABLE "products" ADD COLUMN "raw_etsy_description" varchar;
  ALTER TABLE "products" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "_products_v" ADD COLUMN "version_etsy_title" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_raw_etsy_description" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_generate_slug" boolean DEFAULT true;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" DROP COLUMN "etsy_title";
  ALTER TABLE "products" DROP COLUMN "raw_etsy_description";
  ALTER TABLE "products" DROP COLUMN "generate_slug";
  ALTER TABLE "_products_v" DROP COLUMN "version_etsy_title";
  ALTER TABLE "_products_v" DROP COLUMN "version_raw_etsy_description";
  ALTER TABLE "_products_v" DROP COLUMN "version_generate_slug";`)
}
