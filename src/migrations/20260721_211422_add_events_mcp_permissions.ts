import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_mcp_api_keys" ADD COLUMN IF NOT EXISTS "events_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN IF NOT EXISTS "events_create" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN IF NOT EXISTS "events_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN IF NOT EXISTS "events_delete" boolean DEFAULT false;`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_mcp_api_keys" DROP COLUMN IF EXISTS "events_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN IF EXISTS "events_create";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN IF EXISTS "events_update";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN IF EXISTS "events_delete";`)
}
