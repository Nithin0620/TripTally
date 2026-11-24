-- ============================================
-- TRIPTALLY EXPENSE & INVITES SYSTEM
-- ============================================
-- Run this in Supabase SQL Editor to create necessary tables
-- for the expense management and trip invitation system

-- ============================================
-- CREATE TRIP_INVITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS trip_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trip_invites_trip_id ON trip_invites(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_invites_email ON trip_invites(email);
CREATE INDEX IF NOT EXISTS idx_trip_invites_status ON trip_invites(status);
CREATE INDEX IF NOT EXISTS idx_trip_invites_created ON trip_invites(created_at DESC);

-- Partial unique index to ensure one active invite per email per trip
CREATE UNIQUE INDEX IF NOT EXISTS idx_trip_invites_unique_pending ON trip_invites(trip_id, email) WHERE status = 'pending';

-- ============================================
-- ENSURE EXPENSES TABLE EXISTS
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  paid_by UUID NOT NULL REFERENCES users(id),
  split_type TEXT NOT NULL CHECK (split_type IN ('equal', 'percentage', 'custom', 'shares')),
  notes TEXT,
  category TEXT DEFAULT 'general',
  expense_date DATE DEFAULT CURRENT_DATE,
  description TEXT,
  tags TEXT[],
  currency TEXT DEFAULT 'INR',
  exchange_rate NUMERIC(12, 6) DEFAULT 1,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for expenses
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON expenses(paid_by);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at DESC);

-- ============================================
-- ENSURE EXPENSE_SHARES TABLE EXISTS
-- ============================================
CREATE TABLE IF NOT EXISTS expense_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  share_amount DECIMAL(10, 2) NOT NULL CHECK (share_amount >= 0),
  paid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure one share per user per expense
  UNIQUE(expense_id, user_id)
);

-- Indexes for expense_shares
CREATE INDEX IF NOT EXISTS idx_expense_shares_expense_id ON expense_shares(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_shares_user_id ON expense_shares(user_id);

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on trip_invites
ALTER TABLE trip_invites ENABLE ROW LEVEL SECURITY;

-- Allow users to see invites sent to them by email
CREATE POLICY "Users can see their own invites" ON trip_invites
  FOR SELECT USING (
    auth.jwt() ->> 'email' = email OR
    auth.uid()::text = created_by::text
  );

-- Allow trip creators to manage invites for their trips
CREATE POLICY "Trip creators can manage invites" ON trip_invites
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM trips WHERE trips.id = trip_invites.trip_id AND trips.created_by = auth.uid()
    )
  );

-- Enable RLS on expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Allow trip members to see trip expenses
CREATE POLICY "Trip members can view expenses" ON expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trip_members WHERE trip_members.trip_id = expenses.trip_id AND trip_members.user_id = auth.uid()
    ) OR
    paid_by = auth.uid()
  );

-- Allow users to create expenses for their trips
CREATE POLICY "Users can create expenses for their trips" ON expenses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM trip_members WHERE trip_members.trip_id = trip_id AND trip_members.user_id = auth.uid()
    )
  );

-- Enable RLS on expense_shares
ALTER TABLE expense_shares ENABLE ROW LEVEL SECURITY;

-- Allow trip members to see expense shares
CREATE POLICY "Trip members can view expense shares" ON expense_shares
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM expenses
      INNER JOIN trip_members ON trip_members.trip_id = expenses.trip_id
      WHERE expenses.id = expense_shares.expense_id AND trip_members.user_id = auth.uid()
    ) OR
    user_id = auth.uid()
  );
