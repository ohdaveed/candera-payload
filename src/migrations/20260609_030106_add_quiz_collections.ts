import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "quizzes_questions_options_scores" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"profile_id" integer NOT NULL,
  	"points" numeric DEFAULT 1 NOT NULL
  );
  
  CREATE TABLE "quizzes_questions_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "quizzes_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"prompt" varchar NOT NULL
  );
  
  CREATE TABLE "quizzes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "scent_profiles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"tagline" varchar NOT NULL,
  	"notes" varchar,
  	"editorial" varchar NOT NULL,
  	"featured_product_id" integer,
  	"ambient_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "products" ADD COLUMN "atmosphere_id" integer;
  ALTER TABLE "pages_blocks_storefront_hero" ALTER COLUMN "secondary_cta_label" SET DEFAULT 'Take the Scent Quiz';
  ALTER TABLE "_pages_v_blocks_storefront_hero" ALTER COLUMN "secondary_cta_label" SET DEFAULT 'Take the Scent Quiz';
  ALTER TABLE "pages_blocks_scent_quiz" ADD COLUMN "quiz_id" integer;
  ALTER TABLE "pages_blocks_scent_quiz" ADD COLUMN "form_id_id" integer;
  ALTER TABLE "_pages_v_blocks_scent_quiz" ADD COLUMN "quiz_id" integer;
  ALTER TABLE "_pages_v_blocks_scent_quiz" ADD COLUMN "form_id_id" integer;
  ALTER TABLE "_products_v" ADD COLUMN "version_atmosphere_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "quizzes_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "scent_profiles_id" integer;
  ALTER TABLE "quizzes_questions_options_scores" ADD CONSTRAINT "quizzes_questions_options_scores_profile_id_scent_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."scent_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quizzes_questions_options_scores" ADD CONSTRAINT "quizzes_questions_options_scores_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quizzes_questions_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quizzes_questions_options" ADD CONSTRAINT "quizzes_questions_options_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quizzes_questions_options" ADD CONSTRAINT "quizzes_questions_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quizzes_questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quizzes_questions" ADD CONSTRAINT "quizzes_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "scent_profiles" ADD CONSTRAINT "scent_profiles_featured_product_id_products_id_fk" FOREIGN KEY ("featured_product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "scent_profiles" ADD CONSTRAINT "scent_profiles_ambient_image_id_media_id_fk" FOREIGN KEY ("ambient_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "quizzes_questions_options_scores_order_idx" ON "quizzes_questions_options_scores" USING btree ("_order");
  CREATE INDEX "quizzes_questions_options_scores_parent_id_idx" ON "quizzes_questions_options_scores" USING btree ("_parent_id");
  CREATE INDEX "quizzes_questions_options_scores_profile_idx" ON "quizzes_questions_options_scores" USING btree ("profile_id");
  CREATE INDEX "quizzes_questions_options_order_idx" ON "quizzes_questions_options" USING btree ("_order");
  CREATE INDEX "quizzes_questions_options_parent_id_idx" ON "quizzes_questions_options" USING btree ("_parent_id");
  CREATE INDEX "quizzes_questions_options_image_idx" ON "quizzes_questions_options" USING btree ("image_id");
  CREATE INDEX "quizzes_questions_order_idx" ON "quizzes_questions" USING btree ("_order");
  CREATE INDEX "quizzes_questions_parent_id_idx" ON "quizzes_questions" USING btree ("_parent_id");
  CREATE INDEX "quizzes_updated_at_idx" ON "quizzes" USING btree ("updated_at");
  CREATE INDEX "quizzes_created_at_idx" ON "quizzes" USING btree ("created_at");
  CREATE UNIQUE INDEX "scent_profiles_slug_idx" ON "scent_profiles" USING btree ("slug");
  CREATE INDEX "scent_profiles_featured_product_idx" ON "scent_profiles" USING btree ("featured_product_id");
  CREATE INDEX "scent_profiles_ambient_image_idx" ON "scent_profiles" USING btree ("ambient_image_id");
  CREATE INDEX "scent_profiles_updated_at_idx" ON "scent_profiles" USING btree ("updated_at");
  CREATE INDEX "scent_profiles_created_at_idx" ON "scent_profiles" USING btree ("created_at");
  ALTER TABLE "pages_blocks_scent_quiz" ADD CONSTRAINT "pages_blocks_scent_quiz_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_scent_quiz" ADD CONSTRAINT "pages_blocks_scent_quiz_form_id_id_forms_id_fk" FOREIGN KEY ("form_id_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_scent_quiz" ADD CONSTRAINT "_pages_v_blocks_scent_quiz_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_scent_quiz" ADD CONSTRAINT "_pages_v_blocks_scent_quiz_form_id_id_forms_id_fk" FOREIGN KEY ("form_id_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_atmosphere_id_scent_profiles_id_fk" FOREIGN KEY ("atmosphere_id") REFERENCES "public"."scent_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_atmosphere_id_scent_profiles_id_fk" FOREIGN KEY ("version_atmosphere_id") REFERENCES "public"."scent_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_quizzes_fk" FOREIGN KEY ("quizzes_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_scent_profiles_fk" FOREIGN KEY ("scent_profiles_id") REFERENCES "public"."scent_profiles"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_scent_quiz_quiz_idx" ON "pages_blocks_scent_quiz" USING btree ("quiz_id");
  CREATE INDEX "pages_blocks_scent_quiz_form_id_idx" ON "pages_blocks_scent_quiz" USING btree ("form_id_id");
  CREATE INDEX "_pages_v_blocks_scent_quiz_quiz_idx" ON "_pages_v_blocks_scent_quiz" USING btree ("quiz_id");
  CREATE INDEX "_pages_v_blocks_scent_quiz_form_id_idx" ON "_pages_v_blocks_scent_quiz" USING btree ("form_id_id");
  CREATE INDEX "products_atmosphere_idx" ON "products" USING btree ("atmosphere_id");
  CREATE INDEX "_products_v_version_version_atmosphere_idx" ON "_products_v" USING btree ("version_atmosphere_id");
  CREATE INDEX "payload_locked_documents_rels_quizzes_id_idx" ON "payload_locked_documents_rels" USING btree ("quizzes_id");
  CREATE INDEX "payload_locked_documents_rels_scent_profiles_id_idx" ON "payload_locked_documents_rels" USING btree ("scent_profiles_id");
  ALTER TABLE "pages_blocks_scent_quiz" DROP COLUMN "eyebrow";
  ALTER TABLE "pages_blocks_scent_quiz" DROP COLUMN "headline";
  ALTER TABLE "pages_blocks_scent_quiz" DROP COLUMN "form_id";
  ALTER TABLE "_pages_v_blocks_scent_quiz" DROP COLUMN "eyebrow";
  ALTER TABLE "_pages_v_blocks_scent_quiz" DROP COLUMN "headline";
  ALTER TABLE "_pages_v_blocks_scent_quiz" DROP COLUMN "form_id";
  ALTER TABLE "products" DROP COLUMN "atmosphere";
  ALTER TABLE "_products_v" DROP COLUMN "version_atmosphere";`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "quizzes_questions_options_scores" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quizzes_questions_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quizzes_questions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quizzes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "scent_profiles" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "quizzes_questions_options_scores" CASCADE;
  DROP TABLE "quizzes_questions_options" CASCADE;
  DROP TABLE "quizzes_questions" CASCADE;
  DROP TABLE "quizzes" CASCADE;
  DROP TABLE "scent_profiles" CASCADE;
  ALTER TABLE "pages_blocks_scent_quiz" DROP CONSTRAINT "pages_blocks_scent_quiz_quiz_id_quizzes_id_fk";
  
  ALTER TABLE "pages_blocks_scent_quiz" DROP CONSTRAINT "pages_blocks_scent_quiz_form_id_id_forms_id_fk";
  
  ALTER TABLE "_pages_v_blocks_scent_quiz" DROP CONSTRAINT "_pages_v_blocks_scent_quiz_quiz_id_quizzes_id_fk";
  
  ALTER TABLE "_pages_v_blocks_scent_quiz" DROP CONSTRAINT "_pages_v_blocks_scent_quiz_form_id_id_forms_id_fk";
  
  ALTER TABLE "products" DROP CONSTRAINT "products_atmosphere_id_scent_profiles_id_fk";
  
  ALTER TABLE "_products_v" DROP CONSTRAINT "_products_v_version_atmosphere_id_scent_profiles_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_quizzes_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_scent_profiles_fk";
  
  DROP INDEX "pages_blocks_scent_quiz_quiz_idx";
  DROP INDEX "pages_blocks_scent_quiz_form_id_idx";
  DROP INDEX "_pages_v_blocks_scent_quiz_quiz_idx";
  DROP INDEX "_pages_v_blocks_scent_quiz_form_id_idx";
  DROP INDEX "products_atmosphere_idx";
  DROP INDEX "_products_v_version_version_atmosphere_idx";
  DROP INDEX "payload_locked_documents_rels_quizzes_id_idx";
  DROP INDEX "payload_locked_documents_rels_scent_profiles_id_idx";
  ALTER TABLE "pages_blocks_storefront_hero" ALTER COLUMN "secondary_cta_label" SET DEFAULT 'Take the Scent Quiz →';
  ALTER TABLE "_pages_v_blocks_storefront_hero" ALTER COLUMN "secondary_cta_label" SET DEFAULT 'Take the Scent Quiz →';
  ALTER TABLE "pages_blocks_scent_quiz" ADD COLUMN "eyebrow" varchar DEFAULT 'Find Your Scent';
  ALTER TABLE "pages_blocks_scent_quiz" ADD COLUMN "headline" varchar DEFAULT 'Which Candera ritual is calling you?';
  ALTER TABLE "pages_blocks_scent_quiz" ADD COLUMN "form_id" varchar;
  ALTER TABLE "_pages_v_blocks_scent_quiz" ADD COLUMN "eyebrow" varchar DEFAULT 'Find Your Scent';
  ALTER TABLE "_pages_v_blocks_scent_quiz" ADD COLUMN "headline" varchar DEFAULT 'Which Candera ritual is calling you?';
  ALTER TABLE "_pages_v_blocks_scent_quiz" ADD COLUMN "form_id" varchar;
  ALTER TABLE "products" ADD COLUMN "atmosphere" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_atmosphere" varchar;
  ALTER TABLE "pages_blocks_scent_quiz" DROP COLUMN "quiz_id";
  ALTER TABLE "pages_blocks_scent_quiz" DROP COLUMN "form_id_id";
  ALTER TABLE "_pages_v_blocks_scent_quiz" DROP COLUMN "quiz_id";
  ALTER TABLE "_pages_v_blocks_scent_quiz" DROP COLUMN "form_id_id";
  ALTER TABLE "products" DROP COLUMN "atmosphere_id";
  ALTER TABLE "_products_v" DROP COLUMN "version_atmosphere_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "quizzes_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "scent_profiles_id";`)
}
