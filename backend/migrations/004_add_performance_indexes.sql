CREATE INDEX IF NOT EXISTS idx_events_user_id_created_at
  ON events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wishes_event_id_created_at
  ON wishes(event_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_guestbook_entries_event_id_created_at
  ON guestbook_entries(event_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_gifts_event_id_created_at
  ON gifts(event_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_gifts_event_id_status_created_at
  ON gifts(event_id, status, created_at DESC);
