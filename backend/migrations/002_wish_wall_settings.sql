CREATE TABLE IF NOT EXISTS wish_wall_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID UNIQUE NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wish_wall_settings_event_id ON wish_wall_settings(event_id);
