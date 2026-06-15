import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "documentation" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "content" jsonb,
    "order" numeric DEFAULT 0,
    "generate_slug" boolean DEFAULT true,
    "slug" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE INDEX IF NOT EXISTS "documentation_slug_idx" ON "documentation" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "documentation_updated_at_idx" ON "documentation" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "documentation_created_at_idx" ON "documentation" USING btree ("created_at");

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "documentation_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documentation_fk"
    FOREIGN KEY ("documentation_id") REFERENCES "public"."documentation"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_documentation_id_idx"
    ON "payload_locked_documents_rels" USING btree ("documentation_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_documentation_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_documentation_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "documentation_id";
  DROP TABLE IF EXISTS "documentation" CASCADE;
  `)
}
