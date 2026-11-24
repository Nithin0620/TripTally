DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'trip_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE trip_messages;
  END IF;
END $$;

DROP POLICY IF EXISTS "Trip members can read messages" ON trip_messages;
CREATE POLICY "Trip members can read messages"
  ON trip_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM trip_members
      WHERE trip_members.trip_id = trip_messages.trip_id
        AND trip_members.user_id = auth.uid()
    )
  );
