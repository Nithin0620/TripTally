-- ============================================
-- Additional Schema for Authentication
-- ============================================
-- Run this in your Supabase SQL editor after the main schema

-- Create auth_passwords table for storing password hashes
CREATE TABLE auth_passwords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_auth_passwords_user_id ON auth_passwords(user_id);

-- ============================================
-- Function to handle password updates
-- ============================================
CREATE OR REPLACE FUNCTION update_password_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_password_timestamp_trigger
BEFORE UPDATE ON auth_passwords
FOR EACH ROW
EXECUTE FUNCTION update_password_timestamp();
