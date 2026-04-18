/*
  # Seed Data + RPC
  Run this in the Supabase SQL Editor.
  If you already ran a previous version, this clears old data first.
*/

-- RPC: atomically increment seats_booked
CREATE OR REPLACE FUNCTION increment_seats_booked(p_table_id uuid, p_quantity int)
RETURNS void AS $$
BEGIN
  UPDATE gala_tables SET seats_booked = seats_booked + p_quantity WHERE id = p_table_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clear any previous seed data (safe to re-run)
DELETE FROM gala_tables;
DELETE FROM ticket_tiers;

-- Insert tiers + tables
WITH inserted_tiers AS (
  INSERT INTO ticket_tiers (name, price_kobo, seats_per_table, total_tables, max_capacity, perks)
  VALUES
    (
      'Regular', 1000000, 6, 20, 120,
      ARRAY[
        'Gala Dinner Access',
        'Welcome Drink',
        'Evening Programme',
        'Assigned Table',
        'Unique QR Entry Code'
      ]
    ),
    (
      'VIP', 1700000, 6, 20, 120,
      ARRAY[
        'Priority Seating',
        '3-Course Dinner',
        'Welcome Champagne',
        'Professional Photography',
        'Assigned Table',
        'Unique QR Entry Code'
      ]
    ),
    (
      'VVIP', 2500000, 6, 10, 60,
      ARRAY[
        'Front-Row VIP Table',
        '5-Course Dinner',
        'Open Bar All Evening',
        'Exclusive VVIP Gift',
        'Dedicated Host',
        'Complimentary Ride to the Gala',
        'Unique QR Entry Code'
      ]
    )
  RETURNING id, name
),
regular_tables AS (
  INSERT INTO gala_tables (tier_id, table_number, seats_total, seats_booked)
  SELECT (SELECT id FROM inserted_tiers WHERE name = 'Regular'), n, 6, 0
  FROM generate_series(1, 20) AS n
  RETURNING id
),
vip_tables AS (
  INSERT INTO gala_tables (tier_id, table_number, seats_total, seats_booked)
  SELECT (SELECT id FROM inserted_tiers WHERE name = 'VIP'), n, 6, 0
  FROM generate_series(21, 40) AS n
  RETURNING id
),
vvip_tables AS (
  INSERT INTO gala_tables (tier_id, table_number, seats_total, seats_booked)
  SELECT (SELECT id FROM inserted_tiers WHERE name = 'VVIP'), n, 6, 0
  FROM generate_series(41, 50) AS n
  RETURNING id
)
SELECT 'Done: ' || count(*) || ' tiers inserted' FROM inserted_tiers;
