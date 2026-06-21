import { query } from "../config/db.js";
import type { GuestbookEntryRecord } from "../types/public-event.js";

export async function findGuestbookEntryById(entryId: string) {
  const result = await query<GuestbookEntryRecord>(
    `SELECT id, event_id, sender_name, sender_email, message, is_hidden, created_at
     FROM guestbook_entries
     WHERE id = $1
     LIMIT 1;`,
    [entryId]
  );

  return result.rows[0] ?? null;
}

export async function getEventGuestbookEntriesForOwner(eventId: string) {
  const result = await query<GuestbookEntryRecord>(
    `SELECT id, event_id, sender_name, sender_email, message, is_hidden, created_at
     FROM guestbook_entries
     WHERE event_id = $1
     ORDER BY created_at DESC;`,
    [eventId]
  );

  return result.rows;
}

export async function hideGuestbookEntry(entryId: string) {
  const result = await query<GuestbookEntryRecord>(
    `UPDATE guestbook_entries
     SET is_hidden = TRUE
     WHERE id = $1
     RETURNING id, event_id, sender_name, sender_email, message, is_hidden, created_at;`,
    [entryId]
  );

  return result.rows[0] ?? null;
}

export async function deleteGuestbookEntry(entryId: string) {
  await query("DELETE FROM guestbook_entries WHERE id = $1;", [entryId]);
}
