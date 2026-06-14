import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_blocks_archive_relation_to" ADD VALUE 'products';
  ALTER TYPE "public"."enum__pages_v_blocks_archive_relation_to" ADD VALUE 'products';`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   -- PostgreSQL does not support removing enum values; this migration is one-way.
  SELECT 1;`)
}
