-- ============================================
-- TripTally Complete Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- IMPORTANT: If tables already exist and you're getting errors,
-- you can either:
--   1. Comment out the table creation sections that already exist
--   2. Or use these commands to drop existing tables first:
--      DROP TABLE IF EXISTS waitlist CASCADE;
--      DROP TABLE IF EXISTS visitors CASCADE;

-- ============================================
-- 1. VISITORS & WAITLIST TABLES (Coming Soon Page)
-- ============================================

-- Create visitors table for tracking unique visitors
CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_uuid UUID UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create waitlist table for email signups
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for visitors and waitlist
CREATE INDEX IF NOT EXISTS idx_visitors_uuid ON visitors(visitor_uuid);
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created ON waitlist(created_at DESC);

-- ============================================
-- 2. MAIN APPLICATION TABLES
-- ============================================

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  profile_image TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create auth_passwords table (email/password authentication)
CREATE TABLE IF NOT EXISTS auth_passwords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Single-use, expiring verification/password-reset tokens (hashes only)
CREATE TABLE IF NOT EXISTS auth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('email_verification', 'password_reset')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  destination TEXT,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  cover_image TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create trip_members table (role-based access control)
CREATE TABLE IF NOT EXISTS trip_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(trip_id, user_id)
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  activity_date DATE NOT NULL,
  location TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  notes TEXT,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  paid_by UUID NOT NULL REFERENCES users(id),
  split_type TEXT NOT NULL CHECK (split_type IN ('equal', 'percentage', 'custom', 'shares')),
  category TEXT,
  expense_date DATE DEFAULT CURRENT_DATE,
  description TEXT,
  tags TEXT[],
  currency TEXT DEFAULT 'INR',
  exchange_rate NUMERIC(12, 6) DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create expense_shares table (expense split records)
CREATE TABLE IF NOT EXISTS expense_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  share_amount NUMERIC(10, 2) NOT NULL,
  UNIQUE(expense_id, user_id)
);

-- Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  extracted_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  location TEXT,
  days INTEGER,
  budget_range TEXT,
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- 3. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_trips_created_by ON trips(created_by);
CREATE INDEX IF NOT EXISTS idx_auth_passwords_user_id ON auth_passwords(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_type ON auth_tokens(user_id, type);
CREATE INDEX IF NOT EXISTS idx_trip_members_trip_id ON trip_members(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_members_user_id ON trip_members(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_trip_id ON activities(trip_id);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(activity_date);
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON expenses(paid_by);
CREATE INDEX IF NOT EXISTS idx_expense_shares_expense_id ON expense_shares(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_shares_user_id ON expense_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_expense_id ON receipts(expense_id);
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON templates(created_by);
CREATE INDEX IF NOT EXISTS idx_templates_public ON templates(is_public) WHERE is_public = true;

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. PUBLIC ACCESS POLICIES FOR VISITORS & WAITLIST
-- ============================================

-- Allow anonymous users to insert and read visitors (for coming soon page)
CREATE POLICY "Allow anonymous visitor inserts"
  ON visitors FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous visitor reads"
  ON visitors FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to insert into waitlist
CREATE POLICY "Allow anonymous waitlist inserts"
  ON waitlist FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow service role full access to visitors and waitlist
CREATE POLICY "Service role full access to visitors"
  ON visitors FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to waitlist"
  ON waitlist FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 6. BASIC RLS POLICIES FOR MAIN APP
-- (You can customize these later based on your auth requirements)
-- ============================================

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can read their own password auth record
CREATE POLICY "Users can read own password auth"
  ON auth_passwords FOR SELECT
  USING (auth.uid() = user_id);

-- Trip members can view trips they belong to
CREATE POLICY "Trip members can view trips"
  ON trips FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = trips.id
      AND trip_members.user_id = auth.uid()
    )
  );

-- Trip owners can update trips
CREATE POLICY "Trip owners can update trips"
  ON trips FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Trip owners can delete trips
CREATE POLICY "Trip owners can delete trips"
  ON trips FOR DELETE
  USING (created_by = auth.uid());

-- Users can create new trips
CREATE POLICY "Users can create trips"
  ON trips FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Service role has full access (for API routes using service key)
CREATE POLICY "Service role full access to users"
  ON users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to auth_passwords"
  ON auth_passwords FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to auth_tokens"
  ON auth_tokens FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to trips"
  ON trips FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to trip_members"
  ON trip_members FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to activities"
  ON activities FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to expenses"
  ON expenses FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to expense_shares"
  ON expense_shares FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to receipts"
  ON receipts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to templates"
  ON templates FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 7. ACCOUNT DELETION
-- ============================================

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

-- ============================================
-- 8. HELPFUL VIEWS (OPTIONAL)
-- ============================================

-- View for trip statistics
CREATE OR REPLACE VIEW trip_statistics AS
SELECT 
  t.id as trip_id,
  t.title,
  COUNT(DISTINCT tm.user_id) as member_count,
  COUNT(DISTINCT a.id) as activity_count,
  COUNT(DISTINCT e.id) as expense_count,
  COALESCE(SUM(e.amount), 0) as total_expenses
FROM trips t
LEFT JOIN trip_members tm ON t.id = tm.trip_id
LEFT JOIN activities a ON t.id = a.trip_id
LEFT JOIN expenses e ON t.id = e.trip_id
GROUP BY t.id, t.title;

-- ============================================
-- SETUP COMPLETE! 🎉
-- ============================================
-- You can now:
-- 1. Test your visitors counter
-- 2. Test your waitlist signup
-- 3. Start building your main application features
-- ============================================
