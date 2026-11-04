import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "reviews" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "reviews" ADD COLUMN "body" jsonb;
  ALTER TABLE "reviews" ADD COLUMN "source" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "reviews" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "reviews" DROP COLUMN "body";
  ALTER TABLE "reviews" DROP COLUMN "source";`)
}
