import type { PoolClient } from "pg";

import { db, query } from "../config/db.js";
import type { DbClient } from "../types/database.js";
import type { EventRecord, EventSummaryRecord } from "../types/event.js";

function getExecutor(client?: DbClient) {
  return client ?? db;
}

export async function createEvent(
  input: {
    celebrantName: string;
    coverImageUrl?: string | null;
    description?: string | null;
    eventDate: string;
    eventType: string;
    profileImageUrl?: string | null;
    slug: string;
    title: string;
    userId: string;
  },
  client?: DbClient
) {
  const executor = getExecutor(client);
  const result = await executor.query<EventRecord>(
    `INSERT INTO events (
      user_id,
      title,
      celebrant_name,
      event_type,
      event_date,
      slug,
      profile_image_url,
      cover_image_url,
      description
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING
      id,
      user_id,
      title,
      celebrant_name,
      event_type,
      event_date,
      slug,
      profile_image_url,
      cover_image_url,
      description,
      is_public,
      created_at,
      updated_at;`,
    [
      input.userId,
      input.title,
      input.celebrantName,
      input.eventType,
      input.eventDate,
      input.slug,
      input.profileImageUrl ?? null,
      input.coverImageUrl ?? null,
      input.description ?? null
    ]
  );

  return result.rows[0];
}

export async function updateEvent(
  eventId: string,
  input: {
    celebrantName: string;
    coverImageUrl?: string | null;
    description?: string | null;
    eventDate: string;
    eventType: string;
    profileImageUrl?: string | null;
    title: string;
  },
  client?: DbClient
) {
  const executor = getExecutor(client);
  const result = await executor.query<EventRecord>(
    `UPDATE events
     SET
       title = $2,
       celebrant_name = $3,
       event_type = $4,
       event_date = $5,
       profile_image_url = $6,
       cover_image_url = $7,
       description = $8,
       updated_at = NOW()
     WHERE id = $1
     RETURNING
       id,
       user_id,
       title,
       celebrant_name,
       event_type,
       event_date,
       slug,
       profile_image_url,
       cover_image_url,
       description,
       is_public,
       created_at,
       updated_at;`,
    [
      eventId,
      input.title,
      input.celebrantName,
      input.eventType,
      input.eventDate,
      input.profileImageUrl ?? null,
      input.coverImageUrl ?? null,
      input.description ?? null
    ]
  );

  return result.rows[0] ?? null;
}

export async function deleteEvent(eventId: string, client?: DbClient) {
  const executor = getExecutor(client);
  await executor.query("DELETE FROM events WHERE id = $1;", [eventId]);
}

export async function findEventById(eventId: string) {
  const result = await query<EventRecord>(
    `SELECT
      id,
      user_id,
      title,
      celebrant_name,
      event_type,
      event_date,
      slug,
      profile_image_url,
      cover_image_url,
      description,
      is_public,
      created_at,
      updated_at
     FROM events
     WHERE id = $1
     LIMIT 1;`,
    [eventId]
  );

  return result.rows[0] ?? null;
}

export async function findEventBySlug(slug: string) {
  const result = await query<EventRecord>(
    `SELECT
      id,
      user_id,
      title,
      celebrant_name,
      event_type,
      event_date,
      slug,
      profile_image_url,
      cover_image_url,
      description,
      is_public,
      created_at,
      updated_at
     FROM events
     WHERE slug = $1
     LIMIT 1;`,
    [slug]
  );

  return result.rows[0] ?? null;
}

export async function getMyEvents(userId: string) {
  const result = await query<EventSummaryRecord>(
    `SELECT
      e.id,
      e.user_id,
      e.title,
      e.celebrant_name,
      e.event_type,
      e.event_date,
      e.slug,
      e.profile_image_url,
      e.cover_image_url,
      e.description,
      e.is_public,
      e.created_at,
      e.updated_at,
      COUNT(DISTINCT w.id)::text AS wishes_count,
      COUNT(DISTINCT CASE WHEN g.status = 'success' THEN g.id END)::text AS gifts_count
     FROM events e
     LEFT JOIN wishes w ON w.event_id = e.id
     LEFT JOIN gifts g ON g.event_id = e.id
     WHERE e.user_id = $1
     GROUP BY e.id
     ORDER BY e.created_at DESC;`,
    [userId]
  );

  return result.rows;
}

export async function getPublicEventStats(eventId: string) {
  const result = await query<{
    gifts_count: string;
    guestbook_count: string;
    wishes_count: string;
  }>(
    `SELECT
      (SELECT COUNT(*)::text FROM wishes WHERE event_id = $1 AND is_hidden = FALSE) AS wishes_count,
      (SELECT COUNT(*)::text FROM guestbook_entries WHERE event_id = $1 AND is_hidden = FALSE) AS guestbook_count,
      (SELECT COUNT(*)::text FROM gifts WHERE event_id = $1 AND status = 'success') AS gifts_count;`,
    [eventId]
  );

  return result.rows[0];
}

export async function slugExists(slug: string, excludeEventId?: string) {
  const params: string[] = [slug];
  let sql = "SELECT EXISTS(SELECT 1 FROM events WHERE slug = $1";

  if (excludeEventId) {
    params.push(excludeEventId);
    sql += " AND id <> $2";
  }

  sql += ") AS exists;";

  const result = await query<{ exists: boolean }>(sql, params);
  return result.rows[0]?.exists ?? false;
}

