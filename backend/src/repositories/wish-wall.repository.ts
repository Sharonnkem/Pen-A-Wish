import { db, query } from "../config/db.js";
import type { DbClient } from "../types/database.js";
import type { WishWallSettings, WishWallSettingsRecord } from "../types/wish-wall.js";

function getExecutor(client?: DbClient) {
  return client ?? db;
}

async function ensureWishWallSettingsTable(client?: DbClient) {
  const executor = getExecutor(client);

  await executor.query(`
    CREATE TABLE IF NOT EXISTS wish_wall_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id UUID UNIQUE NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      settings JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await executor.query(`
    CREATE INDEX IF NOT EXISTS idx_wish_wall_settings_event_id
    ON wish_wall_settings(event_id);
  `);
}

export async function findWishWallSettingsByEventId(eventId: string) {
  await ensureWishWallSettingsTable();

  const result = await query<WishWallSettingsRecord>(
    `SELECT id, event_id, settings, created_at, updated_at
     FROM wish_wall_settings
     WHERE event_id = $1
     LIMIT 1;`,
    [eventId]
  );

  return result.rows[0] ?? null;
}

export async function upsertWishWallSettings(
  eventId: string,
  settings: WishWallSettings,
  client?: DbClient
) {
  const executor = getExecutor(client);
  await ensureWishWallSettingsTable(client);

  const result = await executor.query<WishWallSettingsRecord>(
    `INSERT INTO wish_wall_settings (event_id, settings)
     VALUES ($1, $2::jsonb)
     ON CONFLICT (event_id)
     DO UPDATE SET
       settings = EXCLUDED.settings,
       updated_at = NOW()
     RETURNING id, event_id, settings, created_at, updated_at;`,
    [eventId, JSON.stringify(settings)]
  );

  return result.rows[0];
}
