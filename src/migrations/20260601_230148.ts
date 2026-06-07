import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_product_tag" AS ENUM('Bestseller', 'New Release', 'Limited Batch');
  CREATE TABLE "pages_blocks_storefront_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hero_tag" varchar DEFAULT 'Hand-Poured in the Studio',
  	"headline" varchar DEFAULT 'An invitation to slow down.',
  	"subheading" varchar DEFAULT 'Limited Release: Batch 014 now curing in the studio.',
  	"media_id" integer,
  	"primary_cta_label" varchar DEFAULT 'Explore the Collection',
  	"primary_cta_url" varchar DEFAULT '#collection',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author" varchar,
  	"location" varchar,
  	"badge" varchar DEFAULT 'Verified Ritualist'
  );
  
  CREATE TABLE "pages_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Voices of the Inner Circle',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_inner_circle_c_t_a" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar DEFAULT 'Join the Inner Circle',
  	"description" varchar DEFAULT 'Our batches often sell out in days. Join our list to receive early access to new scent drops and personal ritual invitations.',
  	"cta_label" varchar DEFAULT 'Request Entry',
  	"cta_url" varchar DEFAULT '/inner-circle',
  	"media_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_storefront_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_tag" varchar DEFAULT 'Hand-Poured in the Studio',
  	"headline" varchar DEFAULT 'An invitation to slow down.',
  	"subheading" varchar DEFAULT 'Limited Release: Batch 014 now curing in the studio.',
  	"media_id" integer,
  	"primary_cta_label" varchar DEFAULT 'Explore the Collection',
  	"primary_cta_url" varchar DEFAULT '#collection',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author" varchar,
  	"location" varchar,
  	"badge" varchar DEFAULT 'Verified Ritualist',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Voices of the Inner Circle',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_inner_circle_c_t_a" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar DEFAULT 'Join the Inner Circle',
  	"description" varchar DEFAULT 'Our batches often sell out in days. Join our list to receive early access to new scent drops and personal ritual invitations.',
  	"cta_label" varchar DEFAULT 'Request Entry',
  	"cta_url" varchar DEFAULT '/inner-circle',
  	"media_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "products" ADD COLUMN "tagline" varchar;
  ALTER TABLE "products" ADD COLUMN "product_tag" "enum_products_product_tag";
  ALTER TABLE "products" ADD COLUMN "atmosphere" varchar;
  ALTER TABLE "products" ADD COLUMN "burn_time" varchar DEFAULT '50 Hours';
  ALTER TABLE "products" ADD COLUMN "scent_profile_top" varchar;
  ALTER TABLE "products" ADD COLUMN "scent_profile_heart" varchar;
  ALTER TABLE "products" ADD COLUMN "scent_profile_base" varchar;
  ALTER TABLE "products" ADD COLUMN "vessel" varchar;
  ALTER TABLE "products" ADD COLUMN "price" numeric;
  ALTER TABLE "pages_blocks_storefront_hero" ADD CONSTRAINT "pages_blocks_storefront_hero_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_storefront_hero" ADD CONSTRAINT "pages_blocks_storefront_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials_items" ADD CONSTRAINT "pages_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials" ADD CONSTRAINT "pages_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_inner_circle_c_t_a" ADD CONSTRAINT "pages_blocks_inner_circle_c_t_a_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_inner_circle_c_t_a" ADD CONSTRAINT "pages_blocks_inner_circle_c_t_a_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_storefront_hero" ADD CONSTRAINT "_pages_v_blocks_storefront_hero_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_storefront_hero" ADD CONSTRAINT "_pages_v_blocks_storefront_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials_items" ADD CONSTRAINT "_pages_v_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_inner_circle_c_t_a" ADD CONSTRAINT "_pages_v_blocks_inner_circle_c_t_a_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_inner_circle_c_t_a" ADD CONSTRAINT "_pages_v_blocks_inner_circle_c_t_a_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_storefront_hero_order_idx" ON "pages_blocks_storefront_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_storefront_hero_parent_id_idx" ON "pages_blocks_storefront_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_storefront_hero_path_idx" ON "pages_blocks_storefront_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_storefront_hero_media_idx" ON "pages_blocks_storefront_hero" USING btree ("media_id");
  CREATE INDEX "pages_blocks_testimonials_items_order_idx" ON "pages_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_items_parent_id_idx" ON "pages_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_order_idx" ON "pages_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_parent_id_idx" ON "pages_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_path_idx" ON "pages_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "pages_blocks_inner_circle_c_t_a_order_idx" ON "pages_blocks_inner_circle_c_t_a" USING btree ("_order");
  CREATE INDEX "pages_blocks_inner_circle_c_t_a_parent_id_idx" ON "pages_blocks_inner_circle_c_t_a" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_inner_circle_c_t_a_path_idx" ON "pages_blocks_inner_circle_c_t_a" USING btree ("_path");
  CREATE INDEX "pages_blocks_inner_circle_c_t_a_media_idx" ON "pages_blocks_inner_circle_c_t_a" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_storefront_hero_order_idx" ON "_pages_v_blocks_storefront_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_storefront_hero_parent_id_idx" ON "_pages_v_blocks_storefront_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_storefront_hero_path_idx" ON "_pages_v_blocks_storefront_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_storefront_hero_media_idx" ON "_pages_v_blocks_storefront_hero" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_testimonials_items_order_idx" ON "_pages_v_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_items_parent_id_idx" ON "_pages_v_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_order_idx" ON "_pages_v_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_parent_id_idx" ON "_pages_v_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_path_idx" ON "_pages_v_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_inner_circle_c_t_a_order_idx" ON "_pages_v_blocks_inner_circle_c_t_a" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_inner_circle_c_t_a_parent_id_idx" ON "_pages_v_blocks_inner_circle_c_t_a" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_inner_circle_c_t_a_path_idx" ON "_pages_v_blocks_inner_circle_c_t_a" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_inner_circle_c_t_a_media_idx" ON "_pages_v_blocks_inner_circle_c_t_a" USING btree ("media_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_storefront_hero" CASCADE;
  DROP TABLE "pages_blocks_testimonials_items" CASCADE;
  DROP TABLE "pages_blocks_testimonials" CASCADE;
  DROP TABLE "pages_blocks_inner_circle_c_t_a" CASCADE;
  DROP TABLE "_pages_v_blocks_storefront_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials_items" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials" CASCADE;
  DROP TABLE "_pages_v_blocks_inner_circle_c_t_a" CASCADE;
  ALTER TABLE "products" DROP COLUMN "tagline";
  ALTER TABLE "products" DROP COLUMN "product_tag";
  ALTER TABLE "products" DROP COLUMN "atmosphere";
  ALTER TABLE "products" DROP COLUMN "burn_time";
  ALTER TABLE "products" DROP COLUMN "scent_profile_top";
  ALTER TABLE "products" DROP COLUMN "scent_profile_heart";
  ALTER TABLE "products" DROP COLUMN "scent_profile_base";
  ALTER TABLE "products" DROP COLUMN "vessel";
  ALTER TABLE "products" DROP COLUMN "price";
  DROP TYPE "public"."enum_products_product_tag";`)
}
