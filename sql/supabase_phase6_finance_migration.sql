-- ============================================
-- Migration: Phase 6 Finance Completion
-- Run after existing expense, settlement and notification migrations.
-- ============================================

ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_split_type_check;
ALTER TABLE expenses ADD CONSTRAINT expenses_split_type_check
  CHECK (split_type IN ('equal', 'percentage', 'custom', 'shares'));

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('trip_invite', 'expense_added', 'activity_added', 'settlement_updated', 'payment_reminder', 'member_joined', 'system'));

ALTER TABLE settlement_payments ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed';
ALTER TABLE settlement_payments DROP CONSTRAINT IF EXISTS settlement_payments_status_check;
ALTER TABLE settlement_payments ADD CONSTRAINT settlement_payments_status_check
  CHECK (status IN ('pending', 'completed', 'cancelled'));

CREATE INDEX IF NOT EXISTS idx_settlement_payments_status ON settlement_payments(trip_id, status);
CREATE INDEX IF NOT EXISTS idx_receipts_expense_id ON receipts(expense_id);
