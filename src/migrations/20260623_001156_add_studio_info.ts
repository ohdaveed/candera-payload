import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "studio_info_inner_circle_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"description" varchar NOT NULL
  );
  
  CREATE TABLE "studio_info_search_suggestions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"term" varchar NOT NULL
  );
  
  CREATE TABLE "studio_info" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar DEFAULT 'studio@canderacandles.com' NOT NULL,
  	"instagram_handle" varchar DEFAULT '@canderacandles' NOT NULL,
  	"instagram_url" varchar DEFAULT 'https://instagram.com/canderacandles' NOT NULL,
  	"studio_hours" varchar DEFAULT 'By appointment — slow by design.' NOT NULL,
  	"location_tagline" varchar DEFAULT 'Handcrafted in California' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "studio_info_inner_circle_benefits" ADD CONSTRAINT "studio_info_inner_circle_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."studio_info"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "studio_info_search_suggestions" ADD CONSTRAINT "studio_info_search_suggestions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."studio_info"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "studio_info_inner_circle_benefits_order_idx" ON "studio_info_inner_circle_benefits" USING btree ("_order");
  CREATE INDEX "studio_info_inner_circle_benefits_parent_id_idx" ON "studio_info_inner_circle_benefits" USING btree ("_parent_id");
  CREATE INDEX "studio_info_search_suggestions_order_idx" ON "studio_info_search_suggestions" USING btree ("_order");
  CREATE INDEX "studio_info_search_suggestions_parent_id_idx" ON "studio_info_search_suggestions" USING btree ("_parent_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "studio_info_inner_circle_benefits" CASCADE;
  DROP TABLE "studio_info_search_suggestions" CASCADE;
  DROP TABLE "studio_info" CASCADE;`)
}
