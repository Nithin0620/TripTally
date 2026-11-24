CREATE TABLE IF NOT EXISTS trip_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(trim(content)) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trip_messages_trip_created
  ON trip_messages(trip_id, created_at DESC);

ALTER TABLE trip_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to trip_messages" ON trip_messages;
CREATE POLICY "Service role full access to trip_messages"
  ON trip_messages FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
