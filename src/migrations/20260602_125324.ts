import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "etsy_tokens" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar DEFAULT 'Etsy OAuth Token',
  	"access_token" varchar NOT NULL,
  	"refresh_token" varchar NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "etsy_tokens_id" integer;
  CREATE INDEX "etsy_tokens_updated_at_idx" ON "etsy_tokens" USING btree ("updated_at");
  CREATE INDEX "etsy_tokens_created_at_idx" ON "etsy_tokens" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_etsy_tokens_fk" FOREIGN KEY ("etsy_tokens_id") REFERENCES "public"."etsy_tokens"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_etsy_tokens_id_idx" ON "payload_locked_documents_rels" USING btree ("etsy_tokens_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "etsy_tokens" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "etsy_tokens" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_etsy_tokens_fk";
  
  DROP INDEX "payload_locked_documents_rels_etsy_tokens_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "etsy_tokens_id";`)
}
