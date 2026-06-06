import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_product_type" AS ENUM('candle', 'vintage');
  CREATE TYPE "public"."enum__products_v_version_product_type" AS ENUM('candle', 'vintage');
  ALTER TABLE "products" ADD COLUMN "product_type" "enum_products_product_type" DEFAULT 'candle';
  ALTER TABLE "products" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "products" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "products" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_product_type" "enum__products_v_version_product_type" DEFAULT 'candle';
  ALTER TABLE "_products_v" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "_products_v" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "products" ADD CONSTRAINT "products_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "products_meta_meta_image_idx" ON "products" USING btree ("meta_image_id");
  CREATE INDEX "_products_v_version_meta_version_meta_image_idx" ON "_products_v" USING btree ("version_meta_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" DROP CONSTRAINT "products_meta_image_id_media_id_fk";
  
  ALTER TABLE "_products_v" DROP CONSTRAINT "_products_v_version_meta_image_id_media_id_fk";
  
  DROP INDEX "products_meta_meta_image_idx";
  DROP INDEX "_products_v_version_meta_version_meta_image_idx";
  ALTER TABLE "products" DROP COLUMN "product_type";
  ALTER TABLE "products" DROP COLUMN "meta_title";
  ALTER TABLE "products" DROP COLUMN "meta_image_id";
  ALTER TABLE "products" DROP COLUMN "meta_description";
  ALTER TABLE "_products_v" DROP COLUMN "version_product_type";
  ALTER TABLE "_products_v" DROP COLUMN "version_meta_title";
  ALTER TABLE "_products_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_products_v" DROP COLUMN "version_meta_description";
  DROP TYPE "public"."enum_products_product_type";
  DROP TYPE "public"."enum__products_v_version_product_type";`)
}
