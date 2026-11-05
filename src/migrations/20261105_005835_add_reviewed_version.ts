import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "reviews" ADD COLUMN "reviewed_version" varchar;
  CREATE INDEX "reviews_reviewed_version_idx" ON "reviews" USING btree ("reviewed_version");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "reviews_reviewed_version_idx";
  ALTER TABLE "reviews" DROP COLUMN "reviewed_version";`)
}
