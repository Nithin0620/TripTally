ALTER TABLE trip_invites ALTER COLUMN email DROP NOT NULL;

DROP INDEX IF EXISTS idx_trip_invites_unique_pending;
CREATE UNIQUE INDEX IF NOT EXISTS idx_trip_invites_unique_pending
  ON trip_invites(trip_id, email)
  WHERE status = 'pending';
