import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "search_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "search_rels_products_id_idx" ON "search_rels" USING btree ("products_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_products_fk";
  
  DROP INDEX "search_rels_products_id_idx";
  ALTER TABLE "search_rels" DROP COLUMN "products_id";`)
}
