import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" ADD COLUMN "etsy_primary_image_id" integer;
  ALTER TABLE "_products_v" ADD COLUMN "version_etsy_primary_image_id" integer;
  ALTER TABLE "products" ADD CONSTRAINT "products_etsy_primary_image_id_media_id_fk" FOREIGN KEY ("etsy_primary_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_etsy_primary_image_id_media_id_fk" FOREIGN KEY ("version_etsy_primary_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "products_etsy_primary_image_idx" ON "products" USING btree ("etsy_primary_image_id");
  CREATE INDEX "_products_v_version_version_etsy_primary_image_idx" ON "_products_v" USING btree ("version_etsy_primary_image_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" DROP CONSTRAINT "products_etsy_primary_image_id_media_id_fk";
  
  ALTER TABLE "_products_v" DROP CONSTRAINT "_products_v_version_etsy_primary_image_id_media_id_fk";
  
  DROP INDEX "products_etsy_primary_image_idx";
  DROP INDEX "_products_v_version_version_etsy_primary_image_idx";
  ALTER TABLE "products" DROP COLUMN "etsy_primary_image_id";
  ALTER TABLE "_products_v" DROP COLUMN "version_etsy_primary_image_id";`)
}
