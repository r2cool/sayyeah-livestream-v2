import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`livestreams\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`youtube_url\` text NOT NULL,
  	\`logo_type\` text DEFAULT 'svg' NOT NULL,
  	\`logo_svg\` text,
  	\`logo_image_id\` integer,
  	\`theme_background_color\` text DEFAULT '#e5f6fd',
  	\`theme_text_color\` text DEFAULT '#000000',
  	\`theme_button_color\` text DEFAULT '#00AEEF',
  	\`theme_button_text_color\` text DEFAULT '#ffffff',
  	\`theme_font\` text DEFAULT 'system-ui',
  	\`theme_custom_font_name\` text,
  	\`chat_chat_room_arn\` text DEFAULT 'arn:aws:ivschat:eu-west-1:533267334105:room/lDKNWdeinKjR',
  	\`chat_chat_endpoint\` text DEFAULT 'https://5gkn9rs7p3.execute-api.eu-west-1.amazonaws.com/Prod//auth',
  	\`chat_websocket_endpoint\` text DEFAULT 'wss://edge.ivschat.eu-west-1.amazonaws.com',
  	\`text_placeholder\` text DEFAULT 'Vul hier uw bericht in',
  	\`text_button_text\` text DEFAULT 'Verstuur',
  	\`text_instruction\` text DEFAULT 'Vul hierboven uw bericht in en klik op verstuur',
  	\`text_success_message\` text DEFAULT 'Uw bericht is verstuurd en ontvangen',
  	\`text_error_message\` text DEFAULT 'Er is iets misgegaan. Ververs de pagina en probeer opnieuw uw bericht in te sturen',
  	\`text_toast_success_color\` text DEFAULT '#00AEEF',
  	\`text_toast_error_color\` text DEFAULT '#FFAE00',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`logo_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`livestreams_slug_idx\` ON \`livestreams\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`livestreams_logo_image_idx\` ON \`livestreams\` (\`logo_image_id\`);`)
  await db.run(sql`CREATE INDEX \`livestreams_updated_at_idx\` ON \`livestreams\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`livestreams_created_at_idx\` ON \`livestreams\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`livestreams_id\` integer REFERENCES livestreams(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_livestreams_id_idx\` ON \`payload_locked_documents_rels\` (\`livestreams_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`livestreams\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
}
