import { query } from "../config/db.js";
import type {
  GuestbookEntryRecord,
  PublicWishRecord,
  PublicWishPreviewRecord,
  PublicWishWallRecord,
  ReactionCountRecord,
  WishReactionCountRecord
} from "../types/public-event.js";

export async function createWishForEvent(input: {
  eventId: string;
  message: string;
  senderEmail?: string | null;
  senderName: string;
}) {
  const result = await query<{
    created_at: Date;
    event_id: string;
    id: string;
    is_hidden: boolean;
    message: string;
    sender_email: string | null;
    sender_name: string;
  }>(
    `INSERT INTO wishes (event_id, sender_name, sender_email, message)
     VALUES ($1, $2, $3, $4)
     RETURNING id, event_id, sender_name, sender_email, message, is_hidden, created_at;`,
    [input.eventId, input.senderName, input.senderEmail ?? null, input.message]
  );

  return result.rows[0];
}

export async function getRecentVisibleWishesByEventId(eventId: string, limit = 20) {
  const result = await query<PublicWishPreviewRecord>(
    `SELECT id, event_id, sender_name, message, created_at
     FROM wishes
     WHERE event_id = $1 AND is_hidden = FALSE
     ORDER BY created_at DESC
     LIMIT $2;`,
    [eventId, limit]
  );

  return result.rows;
}

export async function getVisibleWishWallEntriesByEventId(eventId: string) {
  const result = await query<PublicWishWallRecord>(
    `SELECT id, event_id, sender_name, sender_email, message, created_at
     FROM wishes
     WHERE event_id = $1 AND is_hidden = FALSE
     ORDER BY created_at DESC;`,
    [eventId]
  );

  return result.rows;
}

export async function findVisiblePublicWishById(wishId: string) {
  const result = await query<PublicWishRecord>(
    `SELECT w.id, w.event_id
     FROM wishes w
     INNER JOIN events e ON e.id = w.event_id
     WHERE w.id = $1 AND w.is_hidden = FALSE AND e.is_public = TRUE
     LIMIT 1;`,
    [wishId]
  );

  return result.rows[0] ?? null;
}

export async function createGuestbookEntryForEvent(input: {
  eventId: string;
  message: string;
  senderEmail?: string | null;
  senderName: string;
}) {
  const result = await query<GuestbookEntryRecord>(
    `INSERT INTO guestbook_entries (event_id, sender_name, sender_email, message)
     VALUES ($1, $2, $3, $4)
     RETURNING id, event_id, sender_name, sender_email, message, is_hidden, created_at;`,
    [input.eventId, input.senderName, input.senderEmail ?? null, input.message]
  );

  return result.rows[0];
}

export async function getRecentVisibleGuestbookEntriesByEventId(eventId: string, limit = 20) {
  const result = await query<GuestbookEntryRecord>(
    `SELECT id, event_id, sender_name, sender_email, message, is_hidden, created_at
     FROM guestbook_entries
     WHERE event_id = $1 AND is_hidden = FALSE
     ORDER BY created_at DESC
     LIMIT $2;`,
    [eventId, limit]
  );

  return result.rows;
}

export async function createReactionForEvent(input: {
  eventId: string;
  ipHash?: string | null;
  reactionType: string;
  visitorFingerprint?: string | null;
}) {
  const result = await query<{
    created_at: Date;
    event_id: string | null;
    id: string;
    ip_hash: string | null;
    reaction_type: string;
    visitor_fingerprint: string | null;
    wish_id: string | null;
  }>(
    `INSERT INTO reactions (
      event_id,
      reaction_type,
      visitor_fingerprint,
      ip_hash
    )
    VALUES ($1, $2, $3, $4)
    RETURNING id, event_id, wish_id, reaction_type, visitor_fingerprint, ip_hash, created_at;`,
    [input.eventId, input.reactionType, input.visitorFingerprint ?? null, input.ipHash ?? null]
  );

  return result.rows[0];
}

export async function createReactionForWish(input: {
  ipHash?: string | null;
  reactionType: string;
  visitorFingerprint?: string | null;
  wishId: string;
}) {
  const result = await query<{
    created_at: Date;
    event_id: string | null;
    id: string;
    ip_hash: string | null;
    reaction_type: string;
    visitor_fingerprint: string | null;
    wish_id: string | null;
  }>(
    `INSERT INTO reactions (
      wish_id,
      reaction_type,
      visitor_fingerprint,
      ip_hash
    )
    VALUES ($1, $2, $3, $4)
    RETURNING id, event_id, wish_id, reaction_type, visitor_fingerprint, ip_hash, created_at;`,
    [input.wishId, input.reactionType, input.visitorFingerprint ?? null, input.ipHash ?? null]
  );

  return result.rows[0];
}

export async function getReactionCountsForEvent(eventId: string) {
  const result = await query<ReactionCountRecord>(
    `SELECT reaction_type, COUNT(*)::text AS reaction_count
     FROM reactions
     WHERE event_id = $1
     GROUP BY reaction_type
     ORDER BY COUNT(*) DESC, reaction_type ASC;`,
    [eventId]
  );

  return result.rows;
}

export async function getReactionCountsForWish(wishId: string) {
  const result = await query<ReactionCountRecord>(
    `SELECT reaction_type, COUNT(*)::text AS reaction_count
     FROM reactions
     WHERE wish_id = $1
     GROUP BY reaction_type
     ORDER BY COUNT(*) DESC, reaction_type ASC;`,
    [wishId]
  );

  return result.rows;
}

export async function getReactionCountsForWishIds(wishIds: string[]) {
  if (!wishIds.length) {
    return [];
  }

  const result = await query<WishReactionCountRecord>(
    `SELECT wish_id, reaction_type, COUNT(*)::text AS reaction_count
     FROM reactions
     WHERE wish_id = ANY($1::uuid[])
     GROUP BY wish_id, reaction_type
     ORDER BY wish_id ASC, COUNT(*) DESC, reaction_type ASC;`,
    [wishIds]
  );

  return result.rows;
}

export async function getRecentReactionForVisitor(input: {
  eventId: string;
  ipHash?: string | null;
  reactionType: string;
  visitorFingerprint?: string | null;
}) {
  if (!input.ipHash && !input.visitorFingerprint) {
    return null;
  }

  const conditions: string[] = ["event_id = $1", "reaction_type = $2", "created_at > NOW() - INTERVAL '30 minutes'"];
  const params: Array<string | null> = [input.eventId, input.reactionType];

  if (input.visitorFingerprint) {
    params.push(input.visitorFingerprint);
    conditions.push(`visitor_fingerprint = $${params.length}`);
  }

  if (input.ipHash) {
    params.push(input.ipHash);
    conditions.push(`ip_hash = $${params.length}`);
  }

  const result = await query<{ id: string }>(
    `SELECT id
     FROM reactions
     WHERE ${conditions.join(" AND ")}
     LIMIT 1;`,
    params
  );

  return result.rows[0] ?? null;
}

export async function getRecentWishReactionForVisitor(input: {
  ipHash?: string | null;
  reactionType: string;
  visitorFingerprint?: string | null;
  wishId: string;
}) {
  if (!input.ipHash && !input.visitorFingerprint) {
    return null;
  }

  const conditions: string[] = [
    "wish_id = $1",
    "reaction_type = $2",
    "created_at > NOW() - INTERVAL '30 minutes'"
  ];
  const params: Array<string | null> = [input.wishId, input.reactionType];

  if (input.visitorFingerprint) {
    params.push(input.visitorFingerprint);
    conditions.push(`visitor_fingerprint = $${params.length}`);
  }

  if (input.ipHash) {
    params.push(input.ipHash);
    conditions.push(`ip_hash = $${params.length}`);
  }

  const result = await query<{ id: string }>(
    `SELECT id
     FROM reactions
     WHERE ${conditions.join(" AND ")}
     LIMIT 1;`,
    params
  );

  return result.rows[0] ?? null;
}
