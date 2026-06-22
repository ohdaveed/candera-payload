import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_documentation_category" AS ENUM('CMS Usage', 'Seeding & Data', 'Etsy Integration', 'Publishing Workflow', 'Design & Theming');
  CREATE TYPE "public"."enum_how_to_guides_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__how_to_guides_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "documentation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"content" jsonb NOT NULL,
  	"category" "enum_documentation_category",
  	"order" numeric DEFAULT 0,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "how_to_guides" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"hero_image_id" integer,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"published_at" timestamp(3) with time zone,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_how_to_guides_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "how_to_guides_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "_how_to_guides_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_hero_image_id" integer,
  	"version_content" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__how_to_guides_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_how_to_guides_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "documentation_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "how_to_guides_id" integer;
  ALTER TABLE "how_to_guides" ADD CONSTRAINT "how_to_guides_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "how_to_guides" ADD CONSTRAINT "how_to_guides_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "how_to_guides_rels" ADD CONSTRAINT "how_to_guides_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."how_to_guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "how_to_guides_rels" ADD CONSTRAINT "how_to_guides_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_how_to_guides_v" ADD CONSTRAINT "_how_to_guides_v_parent_id_how_to_guides_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."how_to_guides"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_how_to_guides_v" ADD CONSTRAINT "_how_to_guides_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_how_to_guides_v" ADD CONSTRAINT "_how_to_guides_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_how_to_guides_v_rels" ADD CONSTRAINT "_how_to_guides_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_how_to_guides_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_how_to_guides_v_rels" ADD CONSTRAINT "_how_to_guides_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "documentation_slug_idx" ON "documentation" USING btree ("slug");
  CREATE INDEX "documentation_updated_at_idx" ON "documentation" USING btree ("updated_at");
  CREATE INDEX "documentation_created_at_idx" ON "documentation" USING btree ("created_at");
  CREATE INDEX "how_to_guides_hero_image_idx" ON "how_to_guides" USING btree ("hero_image_id");
  CREATE INDEX "how_to_guides_meta_meta_image_idx" ON "how_to_guides" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "how_to_guides_slug_idx" ON "how_to_guides" USING btree ("slug");
  CREATE INDEX "how_to_guides_updated_at_idx" ON "how_to_guides" USING btree ("updated_at");
  CREATE INDEX "how_to_guides_created_at_idx" ON "how_to_guides" USING btree ("created_at");
  CREATE INDEX "how_to_guides__status_idx" ON "how_to_guides" USING btree ("_status");
  CREATE INDEX "how_to_guides_rels_order_idx" ON "how_to_guides_rels" USING btree ("order");
  CREATE INDEX "how_to_guides_rels_parent_idx" ON "how_to_guides_rels" USING btree ("parent_id");
  CREATE INDEX "how_to_guides_rels_path_idx" ON "how_to_guides_rels" USING btree ("path");
  CREATE INDEX "how_to_guides_rels_categories_id_idx" ON "how_to_guides_rels" USING btree ("categories_id");
  CREATE INDEX "_how_to_guides_v_parent_idx" ON "_how_to_guides_v" USING btree ("parent_id");
  CREATE INDEX "_how_to_guides_v_version_version_hero_image_idx" ON "_how_to_guides_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_how_to_guides_v_version_meta_version_meta_image_idx" ON "_how_to_guides_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_how_to_guides_v_version_version_slug_idx" ON "_how_to_guides_v" USING btree ("version_slug");
  CREATE INDEX "_how_to_guides_v_version_version_updated_at_idx" ON "_how_to_guides_v" USING btree ("version_updated_at");
  CREATE INDEX "_how_to_guides_v_version_version_created_at_idx" ON "_how_to_guides_v" USING btree ("version_created_at");
  CREATE INDEX "_how_to_guides_v_version_version__status_idx" ON "_how_to_guides_v" USING btree ("version__status");
  CREATE INDEX "_how_to_guides_v_created_at_idx" ON "_how_to_guides_v" USING btree ("created_at");
  CREATE INDEX "_how_to_guides_v_updated_at_idx" ON "_how_to_guides_v" USING btree ("updated_at");
  CREATE INDEX "_how_to_guides_v_latest_idx" ON "_how_to_guides_v" USING btree ("latest");
  CREATE INDEX "_how_to_guides_v_autosave_idx" ON "_how_to_guides_v" USING btree ("autosave");
  CREATE INDEX "_how_to_guides_v_rels_order_idx" ON "_how_to_guides_v_rels" USING btree ("order");
  CREATE INDEX "_how_to_guides_v_rels_parent_idx" ON "_how_to_guides_v_rels" USING btree ("parent_id");
  CREATE INDEX "_how_to_guides_v_rels_path_idx" ON "_how_to_guides_v_rels" USING btree ("path");
  CREATE INDEX "_how_to_guides_v_rels_categories_id_idx" ON "_how_to_guides_v_rels" USING btree ("categories_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documentation_fk" FOREIGN KEY ("documentation_id") REFERENCES "public"."documentation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_how_to_guides_fk" FOREIGN KEY ("how_to_guides_id") REFERENCES "public"."how_to_guides"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_documentation_id_idx" ON "payload_locked_documents_rels" USING btree ("documentation_id");
  CREATE INDEX "payload_locked_documents_rels_how_to_guides_id_idx" ON "payload_locked_documents_rels" USING btree ("how_to_guides_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "documentation" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "how_to_guides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "how_to_guides_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_how_to_guides_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_how_to_guides_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "documentation" CASCADE;
  DROP TABLE "how_to_guides" CASCADE;
  DROP TABLE "how_to_guides_rels" CASCADE;
  DROP TABLE "_how_to_guides_v" CASCADE;
  DROP TABLE "_how_to_guides_v_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_documentation_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_how_to_guides_fk";
  
  DROP INDEX "payload_locked_documents_rels_documentation_id_idx";
  DROP INDEX "payload_locked_documents_rels_how_to_guides_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "documentation_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "how_to_guides_id";
  DROP TYPE "public"."enum_documentation_category";
  DROP TYPE "public"."enum_how_to_guides_status";
  DROP TYPE "public"."enum__how_to_guides_v_version_status";`)
}
