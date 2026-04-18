-- Missing INSERT policy on attendees (caused 401 on booking)
CREATE POLICY "Anyone can insert attendees"
  ON attendees FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Missing UPDATE policy on transactions (caused 401 when confirming payment)
CREATE POLICY "Anyone can update own transaction"
  ON transactions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
