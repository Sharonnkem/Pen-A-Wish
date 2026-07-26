import type { PoolClient } from "pg";

import { db, query } from "../config/db.js";
import type { DbClient } from "../types/database.js";
import type { EventRecord, EventSummaryRecord } from "../types/event.js";

function getExecutor(client?: DbClient) {
  return client ?? db;
}

let hasShowPublicRecentWishesColumnPromise: Promise<boolean> | null = null;
let hasShowPublicRecentGuestbookColumnPromise: Promise<boolean> | null = null;

async function hasShowPublicRecentWishesColumn() {
  if (!hasShowPublicRecentWishesColumnPromise) {
    hasShowPublicRecentWishesColumnPromise = query<{ exists: boolean }>(
      `SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'events'
          AND column_name = 'show_public_recent_wishes'
      ) AS exists;`
    ).then((result) => result.rows[0]?.exists ?? false);
  }

  return hasShowPublicRecentWishesColumnPromise;
}

async function hasShowPublicRecentGuestbookColumn() {
  if (!hasShowPublicRecentGuestbookColumnPromise) {
    hasShowPublicRecentGuestbookColumnPromise = query<{ exists: boolean }>(
      `SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'events'
          AND column_name = 'show_public_recent_guestbook'
      ) AS exists;`
    ).then((result) => result.rows[0]?.exists ?? false);
  }

  return hasShowPublicRecentGuestbookColumnPromise;
}

export async function createEvent(
  input: {
    celebrantName: string;
    coverImageUrl?: string | null;
    description?: string | null;
    eventDate: string;
    eventType: string;
    profileImageUrl?: string | null;
    showPublicRecentGuestbook?: boolean;
    showPublicRecentWishes?: boolean;
    slug: string;
    title: string;
    userId: string;
  },
  client?: DbClient
) {
  const executor = getExecutor(client);
  const hasShowPublicRecentWishes = await hasShowPublicRecentWishesColumn();
  const hasShowPublicRecentGuestbook = await hasShowPublicRecentGuestbookColumn();
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
      description${hasShowPublicRecentWishes ? ",\n      show_public_recent_wishes" : ""}${hasShowPublicRecentGuestbook ? ",\n      show_public_recent_guestbook" : ""}
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9${hasShowPublicRecentWishes ? ", $10" : ""}${hasShowPublicRecentGuestbook ? ", $11" : ""})
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
      ${hasShowPublicRecentWishes ? "show_public_recent_wishes" : "FALSE AS show_public_recent_wishes"},
      ${hasShowPublicRecentGuestbook ? "show_public_recent_guestbook" : "FALSE AS show_public_recent_guestbook"},
      created_at,
      updated_at;`,
    hasShowPublicRecentWishes || hasShowPublicRecentGuestbook
      ? [
      input.userId,
      input.title,
      input.celebrantName,
      input.eventType,
      input.eventDate,
      input.slug,
      input.profileImageUrl ?? null,
      input.coverImageUrl ?? null,
      input.description ?? null,
      ...(hasShowPublicRecentWishes ? [input.showPublicRecentWishes ?? false] : []),
      ...(hasShowPublicRecentGuestbook ? [input.showPublicRecentGuestbook ?? false] : [])
        ]
      : [
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
    showPublicRecentGuestbook?: boolean;
    showPublicRecentWishes?: boolean;
    title: string;
  },
  client?: DbClient
) {
  const executor = getExecutor(client);
  const hasShowPublicRecentWishes = await hasShowPublicRecentWishesColumn();
  const hasShowPublicRecentGuestbook = await hasShowPublicRecentGuestbookColumn();
  const result = await executor.query<EventRecord>(
    `UPDATE events
     SET
       title = $2,
       celebrant_name = $3,
       event_type = $4,
       event_date = $5,
       profile_image_url = $6,
       cover_image_url = $7,
       description = $8${hasShowPublicRecentWishes ? ",\n       show_public_recent_wishes = $9" : ""}${hasShowPublicRecentGuestbook ? `,\n       show_public_recent_guestbook = ${hasShowPublicRecentWishes ? "$10" : "$9"}` : ""},
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
       ${hasShowPublicRecentWishes ? "show_public_recent_wishes" : "FALSE AS show_public_recent_wishes"},
       ${hasShowPublicRecentGuestbook ? "show_public_recent_guestbook" : "FALSE AS show_public_recent_guestbook"},
       created_at,
       updated_at;`,
    hasShowPublicRecentWishes || hasShowPublicRecentGuestbook
      ? [
      eventId,
      input.title,
      input.celebrantName,
      input.eventType,
      input.eventDate,
      input.profileImageUrl ?? null,
      input.coverImageUrl ?? null,
      input.description ?? null,
      ...(hasShowPublicRecentWishes ? [input.showPublicRecentWishes ?? false] : []),
      ...(hasShowPublicRecentGuestbook ? [input.showPublicRecentGuestbook ?? false] : [])
        ]
      : [
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
  const hasShowPublicRecentWishes = await hasShowPublicRecentWishesColumn();
  const hasShowPublicRecentGuestbook = await hasShowPublicRecentGuestbookColumn();
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
      ${hasShowPublicRecentWishes ? "show_public_recent_wishes" : "FALSE AS show_public_recent_wishes"},
      ${hasShowPublicRecentGuestbook ? "show_public_recent_guestbook" : "FALSE AS show_public_recent_guestbook"},
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
  const hasShowPublicRecentWishes = await hasShowPublicRecentWishesColumn();
  const hasShowPublicRecentGuestbook = await hasShowPublicRecentGuestbookColumn();
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
      ${hasShowPublicRecentWishes ? "show_public_recent_wishes" : "FALSE AS show_public_recent_wishes"},
      ${hasShowPublicRecentGuestbook ? "show_public_recent_guestbook" : "FALSE AS show_public_recent_guestbook"},
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
  const hasShowPublicRecentWishes = await hasShowPublicRecentWishesColumn();
  const hasShowPublicRecentGuestbook = await hasShowPublicRecentGuestbookColumn();
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
      ${hasShowPublicRecentWishes ? "e.show_public_recent_wishes" : "FALSE AS show_public_recent_wishes"},
      ${hasShowPublicRecentGuestbook ? "e.show_public_recent_guestbook" : "FALSE AS show_public_recent_guestbook"},
      e.created_at,
      e.updated_at,
      (SELECT COUNT(*)::text
       FROM wishes w
       WHERE w.event_id = e.id) AS wishes_count,
      (SELECT COUNT(*)::text
       FROM gifts g
       WHERE g.event_id = e.id AND g.status = 'success') AS gifts_count
     FROM events e
     WHERE e.user_id = $1
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
