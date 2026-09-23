import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Read all existing livestream slugs
  const result = await db.run(sql`SELECT id, slug FROM livestreams`)
  const rows = (result.results ?? []) as { id: number; slug: string }[]

  if (rows.length === 0) {
    return // nothing to migrate
  }

  // Step 1: Check for collisions after lowercasing
  const normalized = new Map<string, { id: number; original: string }[]>()
  for (const row of rows) {
    const key = row.slug.trim().toLowerCase()
    if (!normalized.has(key)) {
      normalized.set(key, [])
    }
    normalized.get(key)!.push({ id: row.id, original: row.slug })
  }

  const collisions: string[] = []
  for (const [key, entries] of normalized) {
    if (entries.length > 1) {
      const ids = entries.map((e) => `"${e.original}" (id: ${e.id})`).join(', ')
      collisions.push(`  - normalized "${key}" collides from: ${ids}`)
    }
  }

  if (collisions.length > 0) {
    throw new Error(
      `Cannot migrate slugs to lowercase — the following collisions would occur:\n${collisions.join('\n')}\nResolve these conflicts manually before running this migration.`,
    )
  }

  // Step 2: Update only rows whose slug differs from its normalized form
  for (const row of rows) {
    const normalizedSlug = row.slug.trim().toLowerCase()
    if (normalizedSlug !== row.slug) {
      await db.run(sql`UPDATE livestreams SET slug = ${normalizedSlug} WHERE id = ${row.id}`)
    }
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // This migration is lossy — original casing cannot be recovered.
  // No down migration is possible.
}