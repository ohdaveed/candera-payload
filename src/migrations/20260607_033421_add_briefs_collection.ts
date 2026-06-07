import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req: _req }: MigrateUpArgs): Promise<void> {
  try {
    await db.execute(sql`ALTER TYPE "public"."enum_products_product_type" ADD VALUE 'custom';`)
  } catch (e) {
    payload.logger.warn(
      'Value "custom" already exists in enum_products_product_type or other error: ' +
        (e instanceof Error ? e.message : String(e)),
    )
  }
  try {
    await db.execute(
      sql`ALTER TYPE "public"."enum__products_v_version_product_type" ADD VALUE 'custom';`,
    )
  } catch (e) {
    payload.logger.warn(
      'Value "custom" already exists in enum__products_v_version_product_type or other error: ' +
        (e instanceof Error ? e.message : String(e)),
    )
  }

  await db.execute(sql`
  CREATE TABLE "products_specifications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "_products_v_version_specifications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "briefs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"content" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "products" ADD COLUMN "is_customizable" boolean DEFAULT false;
  ALTER TABLE "products" ADD COLUMN "customization_label" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_is_customizable" boolean DEFAULT false;
  ALTER TABLE "_products_v" ADD COLUMN "version_customization_label" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "briefs_id" integer;
  ALTER TABLE "products_specifications" ADD CONSTRAINT "products_specifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_specifications" ADD CONSTRAINT "_products_v_version_specifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_specifications_order_idx" ON "products_specifications" USING btree ("_order");
  CREATE INDEX "products_specifications_parent_id_idx" ON "products_specifications" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_specifications_order_idx" ON "_products_v_version_specifications" USING btree ("_order");
  CREATE INDEX "_products_v_version_specifications_parent_id_idx" ON "_products_v_version_specifications" USING btree ("_parent_id");
  CREATE INDEX "briefs_updated_at_idx" ON "briefs" USING btree ("updated_at");
  CREATE INDEX "briefs_created_at_idx" ON "briefs" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_briefs_fk" FOREIGN KEY ("briefs_id") REFERENCES "public"."briefs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_briefs_id_idx" ON "payload_locked_documents_rels" USING btree ("briefs_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_specifications" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_specifications" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "briefs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products_specifications" CASCADE;
  DROP TABLE "_products_v_version_specifications" CASCADE;
  DROP TABLE "briefs" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_briefs_fk";
  
  ALTER TABLE "products" ALTER COLUMN "product_type" SET DATA TYPE text;
  ALTER TABLE "products" ALTER COLUMN "product_type" SET DEFAULT 'candle'::text;
  DROP TYPE "public"."enum_products_product_type";
  CREATE TYPE "public"."enum_products_product_type" AS ENUM('candle', 'vintage');
  ALTER TABLE "products" ALTER COLUMN "product_type" SET DEFAULT 'candle'::"public"."enum_products_product_type";
  ALTER TABLE "products" ALTER COLUMN "product_type" SET DATA TYPE "public"."enum_products_product_type" USING "product_type"::"public"."enum_products_product_type";
  ALTER TABLE "_products_v" ALTER COLUMN "version_product_type" SET DATA TYPE text;
  ALTER TABLE "_products_v" ALTER COLUMN "version_product_type" SET DEFAULT 'candle'::text;
  DROP TYPE "public"."enum__products_v_version_product_type";
  CREATE TYPE "public"."enum__products_v_version_product_type" AS ENUM('candle', 'vintage');
  ALTER TABLE "_products_v" ALTER COLUMN "version_product_type" SET DEFAULT 'candle'::"public"."enum__products_v_version_product_type";
  ALTER TABLE "_products_v" ALTER COLUMN "version_product_type" SET DATA TYPE "public"."enum__products_v_version_product_type" USING "version_product_type"::"public"."enum__products_v_version_product_type";
  DROP INDEX "payload_locked_documents_rels_briefs_id_idx";
  ALTER TABLE "products" DROP COLUMN "is_customizable";
  ALTER TABLE "products" DROP COLUMN "customization_label";
  ALTER TABLE "_products_v" DROP COLUMN "version_is_customizable";
  ALTER TABLE "_products_v" DROP COLUMN "version_customization_label";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "briefs_id";`)
}
