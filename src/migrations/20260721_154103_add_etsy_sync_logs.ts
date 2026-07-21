import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_etsy_sync_logs_trigger" AS ENUM('dashboard', 'cli');
  CREATE TABLE "etsy_sync_logs_failures" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"listing_id" numeric NOT NULL,
  	"error" varchar NOT NULL
  );
  
  CREATE TABLE "etsy_sync_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"trigger" "enum_etsy_sync_logs_trigger" NOT NULL,
  	"triggered_by_id" integer,
  	"success" boolean DEFAULT false NOT NULL,
  	"count" numeric DEFAULT 0 NOT NULL,
  	"failure_count" numeric DEFAULT 0 NOT NULL,
  	"fatal_error" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "events_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "events_create" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "events_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "events_delete" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "etsy_sync_logs_id" integer;
  ALTER TABLE "etsy_sync_logs_failures" ADD CONSTRAINT "etsy_sync_logs_failures_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."etsy_sync_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "etsy_sync_logs" ADD CONSTRAINT "etsy_sync_logs_triggered_by_id_users_id_fk" FOREIGN KEY ("triggered_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "etsy_sync_logs_failures_order_idx" ON "etsy_sync_logs_failures" USING btree ("_order");
  CREATE INDEX "etsy_sync_logs_failures_parent_id_idx" ON "etsy_sync_logs_failures" USING btree ("_parent_id");
  CREATE INDEX "etsy_sync_logs_triggered_by_idx" ON "etsy_sync_logs" USING btree ("triggered_by_id");
  CREATE INDEX "etsy_sync_logs_updated_at_idx" ON "etsy_sync_logs" USING btree ("updated_at");
  CREATE INDEX "etsy_sync_logs_created_at_idx" ON "etsy_sync_logs" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_etsy_sync_logs_fk" FOREIGN KEY ("etsy_sync_logs_id") REFERENCES "public"."etsy_sync_logs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_etsy_sync_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("etsy_sync_logs_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "etsy_sync_logs_failures" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "etsy_sync_logs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "etsy_sync_logs_failures" CASCADE;
  DROP TABLE "etsy_sync_logs" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_etsy_sync_logs_fk";
  
  DROP INDEX "payload_locked_documents_rels_etsy_sync_logs_id_idx";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "events_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "events_create";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "events_update";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "events_delete";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "etsy_sync_logs_id";
  DROP TYPE "public"."enum_etsy_sync_logs_trigger";`)
}
