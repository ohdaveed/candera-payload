import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_footer_assistance_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_footer_footer_links_link_type" AS ENUM('reference', 'custom');
  CREATE TABLE "footer_assistance_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_assistance_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE "footer_footer_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_footer_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  ALTER TABLE "footer_assistance_items" ADD CONSTRAINT "footer_assistance_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_footer_links" ADD CONSTRAINT "footer_footer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "footer_assistance_items_order_idx" ON "footer_assistance_items" USING btree ("_order");
  CREATE INDEX "footer_assistance_items_parent_id_idx" ON "footer_assistance_items" USING btree ("_parent_id");
  CREATE INDEX "footer_footer_links_order_idx" ON "footer_footer_links" USING btree ("_order");
  CREATE INDEX "footer_footer_links_parent_id_idx" ON "footer_footer_links" USING btree ("_parent_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "footer_assistance_items" CASCADE;
  DROP TABLE "footer_footer_links" CASCADE;
  DROP TYPE "public"."enum_footer_assistance_items_link_type";
  DROP TYPE "public"."enum_footer_footer_links_link_type";`)
}
