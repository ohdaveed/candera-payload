import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_version_product_tag" AS ENUM('Bestseller', 'New Release', 'Limited Batch');
  CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_etsy_listing_id" numeric,
  	"version_slug" varchar,
  	"version_description" jsonb,
  	"version_tagline" varchar,
  	"version_product_tag" "enum__products_v_version_product_tag",
  	"version_atmosphere" varchar,
  	"version_burn_time" varchar,
  	"version_scent_profile_top" varchar,
  	"version_scent_profile_heart" varchar,
  	"version_scent_profile_base" varchar,
  	"version_vessel" varchar,
  	"version_price" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__products_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_products_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"categories_id" integer
  );
  
  ALTER TABLE "products" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "products" ALTER COLUMN "etsy_listing_id" DROP NOT NULL;
  ALTER TABLE "products" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "products" ALTER COLUMN "burn_time" DROP DEFAULT;
  ALTER TABLE "products" ADD COLUMN "_status" "enum_products_status" DEFAULT 'draft';
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_etsy_listing_id_idx" ON "_products_v" USING btree ("version_etsy_listing_id");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_version_version__status_idx" ON "_products_v" USING btree ("version__status");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_latest_idx" ON "_products_v" USING btree ("latest");
  CREATE INDEX "_products_v_autosave_idx" ON "_products_v" USING btree ("autosave");
  CREATE INDEX "_products_v_rels_order_idx" ON "_products_v_rels" USING btree ("order");
  CREATE INDEX "_products_v_rels_parent_idx" ON "_products_v_rels" USING btree ("parent_id");
  CREATE INDEX "_products_v_rels_path_idx" ON "_products_v_rels" USING btree ("path");
  CREATE INDEX "_products_v_rels_media_id_idx" ON "_products_v_rels" USING btree ("media_id");
  CREATE INDEX "_products_v_rels_categories_id_idx" ON "_products_v_rels" USING btree ("categories_id");
  CREATE INDEX "products__status_idx" ON "products" USING btree ("_status");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_products_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "_products_v_rels" CASCADE;
  DROP INDEX "products__status_idx";
  ALTER TABLE "products" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "products" ALTER COLUMN "etsy_listing_id" SET NOT NULL;
  ALTER TABLE "products" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "products" ALTER COLUMN "burn_time" SET DEFAULT '50 Hours';
  ALTER TABLE "products" DROP COLUMN "_status";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum__products_v_version_product_tag";
  DROP TYPE "public"."enum__products_v_version_status";`)
}
