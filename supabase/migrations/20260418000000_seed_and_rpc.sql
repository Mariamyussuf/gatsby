/*
  # Seed Data + Missing RPC
  Run this in the Supabase SQL Editor.
*/

-- QR Scans table
CREATE TABLE IF NOT EXISTS qr_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendee_id uuid NOT NULL REFERENCES attendees(id),
  scanned_at timestamptz DEFAULT now(),
  scanner_note text
);

ALTER TABLE qr_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can insert qr scans"
  ON qr_scans FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Anyone can read qr scans"
  ON qr_scans FOR SELECT TO anon, authenticated USING (true);

-- RPC: atomically increment seats_booked
CREATE OR REPLACE FUNCTION increment_seats_booked(p_table_id uuid, p_quantity int)
RETURNS void AS $$
BEGIN
  UPDATE gala_tables SET seats_booked = seats_booked + p_quantity WHERE id = p_table_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────
-- TICKET TIERS  (edit prices here before running)
-- Prices are in KOBO: ₦25,000 = 2500000
-- ─────────────────────────────────────────────

-- Step 1: insert tiers, capturing their IDs in a CTE
WITH inserted_tiers AS (
  INSERT INTO ticket_tiers (name, price_kobo, seats_per_table, total_tables, max_capacity, perks)
  VALUES
    (
      'Regular',
      2500000,
      10, 10, 100,
      ARRAY[
        'Gourmet 3-course dinner',
        'Live entertainment',
        'Welcome drinks reception',
        'Awards ceremony access',
        'Commemorative event programme'
      ]
    ),
    (
      'VIP',
      4000000,
      8, 6, 48,
      ARRAY[
        'All Regular perks',
        'Priority seating near the stage',
        'Exclusive VIP cocktail lounge access',
        'Premium wine & spirits service',
        'Personalised name card & gift bag'
      ]
    ),
    (
      'VVIP',
      6500000,
      6, 4, 24,
      ARRAY[
        'All VIP perks',
        'Front-row reserved table',
        'Complimentary chauffeur pickup',
        'Private meet & greet with speakers',
        'Luxury gift hamper',
        'Professional event photography'
      ]
    )
  RETURNING id, name
),

-- Step 2: generate table rows for Regular (tables 1–10)
regular_tables AS (
  INSERT INTO gala_tables (tier_id, table_number, seats_total, seats_booked)
  SELECT
    (SELECT id FROM inserted_tiers WHERE name = 'Regular'),
    n,
    10,
    0
  FROM generate_series(1, 10) AS n
  RETURNING id
),

-- Step 3: VIP tables (11–16)
vip_tables AS (
  INSERT INTO gala_tables (tier_id, table_number, seats_total, seats_booked)
  SELECT
    (SELECT id FROM inserted_tiers WHERE name = 'VIP'),
    n,
    8,
    0
  FROM generate_series(11, 16) AS n
  RETURNING id
),

-- Step 4: VVIP tables (17–20)
vvip_tables AS (
  INSERT INTO gala_tables (tier_id, table_number, seats_total, seats_booked)
  SELECT
    (SELECT id FROM inserted_tiers WHERE name = 'VVIP'),
    n,
    6,
    0
  FROM generate_series(17, 20) AS n
  RETURNING id
)

SELECT 'Seeded: ' || count(*) || ' tiers and tables' FROM inserted_tiers;
