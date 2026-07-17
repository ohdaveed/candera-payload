import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_the_vessels" ALTER COLUMN "eyebrow" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_the_vessels" ALTER COLUMN "eyebrow" DROP DEFAULT;`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_the_vessels" ALTER COLUMN "eyebrow" SET DEFAULT 'The Vessels';
  ALTER TABLE "_pages_v_blocks_the_vessels" ALTER COLUMN "eyebrow" SET DEFAULT 'The Vessels';`)
}
