import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`livestreams\` ADD \`access_mode\` text DEFAULT 'public' NOT NULL;`)
  await db.run(sql`ALTER TABLE \`livestreams\` ADD \`password\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`livestreams\` DROP COLUMN \`access_mode\`;`)
  await db.run(sql`ALTER TABLE \`livestreams\` DROP COLUMN \`password\`;`)
}
