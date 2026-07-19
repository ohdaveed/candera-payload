import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_testimonials_items" ALTER COLUMN "badge" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_testimonials_items" ALTER COLUMN "badge" DROP DEFAULT;`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_testimonials_items" ALTER COLUMN "badge" SET DEFAULT 'Verified Ritualist';
  ALTER TABLE "_pages_v_blocks_testimonials_items" ALTER COLUMN "badge" SET DEFAULT 'Verified Ritualist';`)
}
