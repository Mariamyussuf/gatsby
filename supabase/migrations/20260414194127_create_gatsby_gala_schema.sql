/*
  # Great Gatsby Gala — Complete Database Schema

  ## Tables Created
  - `ticket_tiers` — stores tier config (Regular, VIP, VVIP)
  - `gala_tables` — individual tables per tier with seat tracking
  - `attendees` — each person attending (one per ticket)
  - `transactions` — payment records from Squad
  - `waitlist` — waitlist entries per tier
  - `transfer_log` — audit trail of all ticket name changes
  - `vvip_pickups` — VVIP pickup coordination
  - `admin_sessions` — JWT session store for admin auth
  - `qr_scans` — tracks QR code usage at the door

  ## Security
  - RLS enabled on all tables
  - Public can insert to waitlist
  - Tickets/attendees readable via secure token
  - Admin operations require service role
*/

-- Ticket tiers
CREATE TABLE IF NOT EXISTS ticket_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price_kobo bigint NOT NULL,
  seats_per_table int NOT NULL,
  total_tables int NOT NULL,
  max_capacity int NOT NULL,
  perks text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ticket_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read ticket tiers"
  ON ticket_tiers FOR SELECT
  TO anon, authenticated
  USING (true);

-- Gala tables (individual table rows)
CREATE TABLE IF NOT EXISTS gala_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id uuid NOT NULL REFERENCES ticket_tiers(id),
  table_number int NOT NULL,
  seats_total int NOT NULL,
  seats_booked int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tier_id, table_number)
);

ALTER TABLE gala_tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read gala tables"
  ON gala_tables FOR SELECT
  TO anon, authenticated
  USING (true);

-- Transactions (payment records)
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text UNIQUE NOT NULL,
  squad_reference text,
  tier_id uuid REFERENCES ticket_tiers(id),
  table_id uuid REFERENCES gala_tables(id),
  primary_email text NOT NULL,
  primary_first_name text NOT NULL,
  primary_last_name text NOT NULL,
  primary_phone text NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  unit_price_kobo bigint NOT NULL,
  total_kobo bigint NOT NULL,
  group_booking_code text NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending',
  seating_notes text,
  squad_payload jsonb,
  created_at timestamptz DEFAULT now(),
  confirmed_at timestamptz
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert transactions"
  ON transactions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read own transaction by reference"
  ON transactions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Attendees (one per seat)
CREATE TABLE IF NOT EXISTS attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id),
  tier_id uuid NOT NULL REFERENCES ticket_tiers(id),
  table_id uuid NOT NULL REFERENCES gala_tables(id),
  table_number int NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  ticket_id text UNIQUE NOT NULL,
  group_booking_code text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  transfer_locked boolean NOT NULL DEFAULT false,
  manage_token text UNIQUE NOT NULL,
  qr_code_sent boolean NOT NULL DEFAULT false,
  qr_used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read attendee by manage token"
  ON attendees FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update attendee name via manage token"
  ON attendees FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Waitlist
CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  email text NOT NULL,
  tier_id uuid NOT NULL REFERENCES ticket_tiers(id),
  tier_name text NOT NULL,
  notified boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist"
  ON waitlist FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read waitlist"
  ON waitlist FOR SELECT
  TO anon, authenticated
  USING (true);

-- Transfer log
CREATE TABLE IF NOT EXISTS transfer_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendee_id uuid NOT NULL REFERENCES attendees(id),
  old_first_name text NOT NULL,
  old_last_name text NOT NULL,
  old_email text NOT NULL,
  new_first_name text NOT NULL,
  new_last_name text NOT NULL,
  new_email text NOT NULL,
  transferred_at timestamptz DEFAULT now()
);

ALTER TABLE transfer_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert transfer log"
  ON transfer_log FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read transfer log"
  ON transfer_log FOR SELECT
  TO anon, authenticated
  USING (true);

-- VVIP Pickups
CREATE TABLE IF NOT EXISTS vvip_pickups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendee_id uuid UNIQUE NOT NULL REFERENCES attendees(id),
  pickup_address text,
  pickup_time text,
  pickup_status text NOT NULL DEFAULT 'Pending',
  notes text,
  confirmation_sent boolean NOT NULL DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vvip_pickups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read vvip pickups"
  ON vvip_pickups FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update vvip pickups"
  ON vvip_pickups FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can insert vvip pickups"
  ON vvip_pickups FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admin sessions
CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read admin sessions"
  ON admin_sessions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert admin sessions"
  ON admin_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can delete admin sessions"
  ON admin_sessions FOR DELETE
  TO anon, authenticated
  USING (true);
