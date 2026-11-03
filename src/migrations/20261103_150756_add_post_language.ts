import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_posts_language" AS ENUM('en', 'id');
  CREATE TYPE "public"."enum__posts_v_version_language" AS ENUM('en', 'id');
  ALTER TABLE "posts" ADD COLUMN "language" "enum_posts_language" DEFAULT 'en';
  ALTER TABLE "_posts_v" ADD COLUMN "version_language" "enum__posts_v_version_language" DEFAULT 'en';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" DROP COLUMN "language";
  ALTER TABLE "_posts_v" DROP COLUMN "version_language";
  DROP TYPE "public"."enum_posts_language";
  DROP TYPE "public"."enum__posts_v_version_language";`)
}
