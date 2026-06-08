import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_scent_quiz" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Find Your Scent',
  	"headline" varchar DEFAULT 'Which Candera ritual is calling you?',
  	"form_id" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_scent_quiz" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Find Your Scent',
  	"headline" varchar DEFAULT 'Which Candera ritual is calling you?',
  	"form_id" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_scent_quiz" ADD CONSTRAINT "pages_blocks_scent_quiz_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_scent_quiz" ADD CONSTRAINT "_pages_v_blocks_scent_quiz_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_scent_quiz_order_idx" ON "pages_blocks_scent_quiz" USING btree ("_order");
  CREATE INDEX "pages_blocks_scent_quiz_parent_id_idx" ON "pages_blocks_scent_quiz" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_scent_quiz_path_idx" ON "pages_blocks_scent_quiz" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_scent_quiz_order_idx" ON "_pages_v_blocks_scent_quiz" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_scent_quiz_parent_id_idx" ON "_pages_v_blocks_scent_quiz" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_scent_quiz_path_idx" ON "_pages_v_blocks_scent_quiz" USING btree ("_path");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_scent_quiz" CASCADE;
  DROP TABLE "_pages_v_blocks_scent_quiz" CASCADE;`)
}
