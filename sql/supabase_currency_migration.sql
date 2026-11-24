-- Migration: Add currency and budget columns to trips table
-- Run this against your Supabase database

-- Add currency column (defaults to INR for Indian-focused app)
ALTER TABLE trips ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'INR';

-- Add budget limit column (optional, in the trip's currency)
ALTER TABLE trips ADD COLUMN IF NOT EXISTS budget_limit NUMERIC(12, 2);

-- Add a check constraint for valid currency codes (optional, allows flexibility)
-- We use a text column rather than an enum to support adding currencies without migrations

-- Update the trip_statistics view to include budget info
CREATE OR REPLACE VIEW trip_statistics AS
SELECT
  t.id AS trip_id,
  t.title,
  t.currency,
  t.budget_limit,
  COUNT(DISTINCT tm.id) AS member_count,
  COUNT(DISTINCT a.id) AS activity_count,
  COUNT(DISTINCT e.id) AS expense_count,
  COALESCE(SUM(e.amount), 0) AS total_expenses,
  CASE
    WHEN t.budget_limit IS NOT NULL AND t.budget_limit > 0
    THEN t.budget_limit - COALESCE(SUM(e.amount), 0)
    ELSE NULL
  END AS remaining_budget
FROM trips t
LEFT JOIN trip_members tm ON tm.trip_id = t.id
LEFT JOIN activities a ON a.trip_id = t.id
LEFT JOIN expenses e ON e.trip_id = t.id
GROUP BY t.id, t.title, t.currency, t.budget_limit;

-- Add index for currency (useful for filtering/reporting)
CREATE INDEX IF NOT EXISTS idx_trips_currency ON trips(currency);
