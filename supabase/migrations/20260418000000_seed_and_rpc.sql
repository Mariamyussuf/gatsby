/*
  # Seed Data + Missing RPC

  Run this in the Supabase SQL Editor after the main schema migration.

  ## What this adds:
  - qr_scans table
  - increment_seats_booked() RPC (used by booking flow)
  - Ticket tiers: Regular, VIP, VVIP
  - Gala tables for each tier
  
  ## Adjust pricing and table counts to match your event before running.
*/

-- QR Scans table (tracks door check-in scans)
CREATE TABLE IF NOT EXISTS qr_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendee_id uuid NOT NULL REFERENCES attendees(id),
  scanned_at timestamptz DEFAULT now(),
  scanner_note text
);

ALTER TABLE qr_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert qr scans"
  ON qr_scans FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read qr scans"
  ON qr_scans FOR SELECT
  TO anon, authenticated
  USING (true);

-- RPC: atomically increment seats_booked on a table
CREATE OR REPLACE FUNCTION increment_seats_booked(p_table_id uuid, p_quantity int)
RETURNS void AS $$
BEGIN
  UPDATE gala_tables
  SET seats_booked = seats_booked + p_quantity
  WHERE id = p_table_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────
-- TICKET TIERS  (adjust prices as needed)
-- Prices are in KOBO (1 Naira = 100 kobo)
-- ₦25,000 = 2500000 kobo
-- ─────────────────────────────────────────────
INSERT INTO ticket_tiers (id, name, price_kobo, seats_per_table, total_tables, max_capacity, perks)
VALUES
  (
    gen_random_uuid(),
    'Regular',
    2500000,   -- ₦25,000
    10,
    10,
    100,
    ARRAY[
      'Gourmet 3-course dinner',
      'Live entertainment',
      'Welcome drinks reception',
      'Awards ceremony access',
      'Commemorative event programme'
    ]
  ),
  (
    gen_random_uuid(),
    'VIP',
    4000000,   -- ₦40,000
    8,
    6,
    48,
    ARRAY[
      'All Regular perks',
      'Priority seating near the stage',
      'Exclusive VIP cocktail lounge access',
      'Premium wine & spirits service',
      'Personalised name card & gift bag'
    ]
  ),
  (
    gen_random_uuid(),
    'VVIP',
    6500000,   -- ₦65,000
    6,
    4,
    24,
    ARRAY[
      'All VIP perks',
      'Front-row reserved table',
      'Complimentary chauffeur pickup',
      'Private meet & greet with speakers',
      'Luxury gift hamper',
      'Professional event photography'
    ]
  )
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
-- GALA TABLES  (auto-generated from tier config)
-- ─────────────────────────────────────────────
DO $$
DECLARE
  r_id uuid;
  v_id uuid;
  vv_id uuid;
  i int;
BEGIN
  SELECT id INTO r_id  FROM ticket_tiers WHERE name = 'Regular' LIMIT 1;
  SELECT id INTO v_id  FROM ticket_tiers WHERE name = 'VIP'     LIMIT 1;
  SELECT id INTO vv_id FROM ticket_tiers WHERE name = 'VVIP'    LIMIT 1;

  -- Regular tables: 1–10
  FOR i IN 1..10 LOOP
    INSERT INTO gala_tables (tier_id, table_number, seats_total, seats_booked)
    VALUES (r_id, i, 10, 0)
    ON CONFLICT (tier_id, table_number) DO NOTHING;
  END LOOP;

  -- VIP tables: 11–16
  FOR i IN 11..16 LOOP
    INSERT INTO gala_tables (tier_id, table_number, seats_total, seats_booked)
    VALUES (v_id, i, 8, 0)
    ON CONFLICT (tier_id, table_number) DO NOTHING;
  END LOOP;

  -- VVIP tables: 17–20
  FOR i IN 17..20 LOOP
    INSERT INTO gala_tables (tier_id, table_number, seats_total, seats_booked)
    VALUES (vv_id, i, 6, 0)
    ON CONFLICT (tier_id, table_number) DO NOTHING;
  END LOOP;
END;
$$;
