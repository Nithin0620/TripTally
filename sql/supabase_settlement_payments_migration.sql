-- ============================================
-- Migration: Settlement Payments Persistence
-- ============================================

CREATE TABLE IF NOT EXISTS settlement_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(10) DEFAULT 'INR',
  payment_method VARCHAR(50) DEFAULT 'other', -- 'upi', 'cash', 'bank_transfer', 'other'
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_settlement_payments_trip ON settlement_payments(trip_id);
CREATE INDEX IF NOT EXISTS idx_settlement_payments_from ON settlement_payments(from_user_id);
CREATE INDEX IF NOT EXISTS idx_settlement_payments_to ON settlement_payments(to_user_id);
CREATE INDEX IF NOT EXISTS idx_settlement_payments_status ON settlement_payments(trip_id, status);
