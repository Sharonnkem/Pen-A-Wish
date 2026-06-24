CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  role VARCHAR(30) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  celebrant_name VARCHAR(150) NOT NULL,
  event_type VARCHAR(80) NOT NULL,
  event_date DATE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  profile_image_url TEXT,
  cover_image_url TEXT,
  description TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  show_public_recent_wishes BOOLEAN NOT NULL DEFAULT FALSE,
  show_public_recent_guestbook BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  sender_name VARCHAR(150) NOT NULL,
  sender_email VARCHAR(255),
  message TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guestbook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  sender_name VARCHAR(150) NOT NULL,
  sender_email VARCHAR(255),
  message TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  wish_id UUID REFERENCES wishes(id) ON DELETE CASCADE,
  reaction_type VARCHAR(50) NOT NULL,
  visitor_fingerprint TEXT,
  ip_hash TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  CHECK (
    event_id IS NOT NULL OR wish_id IS NOT NULL
  )
);

CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance_kobo BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_name VARCHAR(150) NOT NULL,
  sender_email VARCHAR(255),
  message TEXT,
  amount_kobo BIGINT NOT NULL,
  platform_fee_kobo BIGINT NOT NULL,
  total_charged_kobo BIGINT NOT NULL,
  paystack_reference VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  amount_kobo BIGINT NOT NULL,
  bank_name VARCHAR(150) NOT NULL,
  account_number VARCHAR(30) NOT NULL,
  account_name VARCHAR(150),
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  gift_id UUID REFERENCES gifts(id) ON DELETE SET NULL,
  withdrawal_request_id UUID REFERENCES withdrawal_requests(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL,
  amount_kobo BIGINT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'completed',
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  wish_id UUID REFERENCES wishes(id) ON DELETE SET NULL,
  guestbook_entry_id UUID REFERENCES guestbook_entries(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  status VARCHAR(30) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users(id),
  action VARCHAR(150) NOT NULL,
  entity_type VARCHAR(80),
  entity_id UUID,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_wishes_event_id ON wishes(event_id);
CREATE INDEX IF NOT EXISTS idx_guestbook_event_id ON guestbook_entries(event_id);
CREATE INDEX IF NOT EXISTS idx_reactions_event_id ON reactions(event_id);
CREATE INDEX IF NOT EXISTS idx_reactions_wish_id ON reactions(wish_id);
CREATE INDEX IF NOT EXISTS idx_gifts_event_id ON gifts(event_id);
CREATE INDEX IF NOT EXISTS idx_gifts_user_id ON gifts(user_id);
CREATE INDEX IF NOT EXISTS idx_gifts_reference ON gifts(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawal_requests(status);
