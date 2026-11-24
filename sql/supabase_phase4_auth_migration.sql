-- ============================================
-- Phase 4 Migration: Auth & Account Completion
-- Run this in Supabase SQL Editor
-- ============================================

-- Existing accounts were created before email verification existed. Adding the
-- column as nullable first lets us backfill only legacy rows; every new account
-- created after this migration defaults to unverified.
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN;
UPDATE users SET email_verified = true WHERE email_verified IS NULL;
ALTER TABLE users ALTER COLUMN email_verified SET DEFAULT false;
ALTER TABLE users ALTER COLUMN email_verified SET NOT NULL;

-- Single-use, expiring verification and password-reset tokens. Only hashes are
-- stored; the raw token is sent once by email.
CREATE TABLE IF NOT EXISTS auth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('email_verification', 'password_reset')),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_type ON auth_tokens(user_id, type);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON auth_tokens(expires_at);

ALTER TABLE auth_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to auth_tokens" ON auth_tokens;
CREATE POLICY "Service role full access to auth_tokens"
  ON auth_tokens FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Account deletion must clear rows that reference users without ON DELETE CASCADE.
-- Owned trips and their dependent rows are removed by the existing CASCADE on
-- trips.created_by.
CREATE OR REPLACE FUNCTION delete_user_account(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM auth_tokens WHERE user_id = target_user_id;
  DELETE FROM expense_shares WHERE user_id = target_user_id;
  DELETE FROM expenses WHERE paid_by = target_user_id;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'expenses'
      AND column_name = 'created_by'
  ) THEN
    EXECUTE 'DELETE FROM expenses WHERE created_by = $1' USING target_user_id;
  END IF;

  DELETE FROM users WHERE id = target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION delete_user_account(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO service_role;
