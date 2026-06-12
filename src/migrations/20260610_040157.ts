import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" ALTER COLUMN "burn_time" SET DEFAULT '60 Hours';
  ALTER TABLE "_products_v" ALTER COLUMN "version_burn_time" SET DEFAULT '60 Hours';`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" ALTER COLUMN "burn_time" DROP DEFAULT;
  ALTER TABLE "_products_v" ALTER COLUMN "version_burn_time" DROP DEFAULT;`)
}
