import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`livestreams\` ADD \`text_password_form_title\` text DEFAULT 'Wachtwoord Vereist';`)
  await db.run(sql`ALTER TABLE \`livestreams\` ADD \`text_password_form_instruction\` text DEFAULT 'Voer het wachtwoord in om toegang te krijgen tot de livestream.';`)
  await db.run(sql`ALTER TABLE \`livestreams\` ADD \`text_password_form_label_text\` text DEFAULT 'Wachtwoord';`)
  await db.run(sql`ALTER TABLE \`livestreams\` ADD \`text_password_form_placeholder\` text DEFAULT 'Vul hier uw wachtwoord in';`)
  await db.run(sql`ALTER TABLE \`livestreams\` ADD \`text_password_form_button_text\` text DEFAULT 'Stream ontgrendelen';`)
  await db.run(sql`ALTER TABLE \`livestreams\` ADD \`text_password_form_error_message\` text DEFAULT 'Onjuist wachtwoord. Probeer het opnieuw.';`)
  await db.run(sql`ALTER TABLE \`livestreams\` ADD \`text_username_form_title\` text DEFAULT 'Gebruikersnaam Invoeren';`)
  await db.run(sql`ALTER TABLE \`livestreams\` ADD \`text_username_form_instruction\` text DEFAULT 'Voer een gebruikersnaam in om deel te nemen aan de chat en de stream te bekijken.';`)
  await db.run(sql`ALTER TABLE \`livestreams\` ADD \`text_username_form_label_text\` text DEFAULT 'Gebruikersnaam';`)
  await db.run(sql`ALTER TABLE \`livestreams\` ADD \`text_username_form_placeholder\` text DEFAULT 'Kies een gebruikersnaam';`)
  await db.run(sql`ALTER TABLE \`livestreams\` ADD \`text_username_form_button_text\` text DEFAULT 'Deelnemen';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`livestreams\` DROP COLUMN \`text_password_form_title\`;`)
  await db.run(sql`ALTER TABLE \`livestreams\` DROP COLUMN \`text_password_form_instruction\`;`)
  await db.run(sql`ALTER TABLE \`livestreams\` DROP COLUMN \`text_password_form_label_text\`;`)
  await db.run(sql`ALTER TABLE \`livestreams\` DROP COLUMN \`text_password_form_placeholder\`;`)
  await db.run(sql`ALTER TABLE \`livestreams\` DROP COLUMN \`text_password_form_button_text\`;`)
  await db.run(sql`ALTER TABLE \`livestreams\` DROP COLUMN \`text_password_form_error_message\`;`)
  await db.run(sql`ALTER TABLE \`livestreams\` DROP COLUMN \`text_username_form_title\`;`)
  await db.run(sql`ALTER TABLE \`livestreams\` DROP COLUMN \`text_username_form_instruction\`;`)
  await db.run(sql`ALTER TABLE \`livestreams\` DROP COLUMN \`text_username_form_label_text\`;`)
  await db.run(sql`ALTER TABLE \`livestreams\` DROP COLUMN \`text_username_form_placeholder\`;`)
  await db.run(sql`ALTER TABLE \`livestreams\` DROP COLUMN \`text_username_form_button_text\`;`)
}
