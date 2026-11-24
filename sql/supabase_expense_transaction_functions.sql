-- ============================================
-- EXPENSE TRANSACTION FUNCTIONS
-- ============================================
-- Run this migration in Supabase SQL editor.
-- Each function executes in a single DB transaction.

DROP FUNCTION IF EXISTS create_expense_with_shares(UUID, TEXT, NUMERIC, UUID, TEXT, TEXT, TEXT, UUID, JSONB);

CREATE OR REPLACE FUNCTION create_expense_with_shares(
  p_trip_id UUID,
  p_title TEXT,
  p_amount NUMERIC,
  p_paid_by UUID,
  p_split_type TEXT,
  p_notes TEXT,
  p_category TEXT,
  p_created_by UUID,
  p_shares JSONB,
  p_expense_date DATE,
  p_description TEXT,
  p_tags TEXT[],
  p_currency TEXT,
  p_exchange_rate NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_expense expenses%ROWTYPE;
BEGIN
  INSERT INTO expenses (
    trip_id,
    title,
    amount,
    paid_by,
    split_type,
    notes,
    category,
    created_by,
    expense_date,
    description,
    tags,
    currency,
    exchange_rate
  )
  VALUES (
    p_trip_id,
    p_title,
    p_amount,
    p_paid_by,
    p_split_type,
    p_notes,
    COALESCE(p_category, 'general'),
    p_created_by,
    COALESCE(p_expense_date, CURRENT_DATE),
    p_description,
    p_tags,
    COALESCE(p_currency, 'INR'),
    COALESCE(p_exchange_rate, 1)
  )
  RETURNING * INTO v_expense;

  INSERT INTO expense_shares (expense_id, user_id, share_amount, paid_amount)
  SELECT
    v_expense.id,
    s.user_id,
    s.share_amount,
    COALESCE(s.paid_amount, 0)
  FROM jsonb_to_recordset(p_shares) AS s(
    user_id UUID,
    share_amount NUMERIC,
    paid_amount NUMERIC
  );

  RETURN to_jsonb(v_expense);
END;
$$;

DROP FUNCTION IF EXISTS update_expense_with_shares(UUID, TEXT, NUMERIC, UUID, TEXT, TEXT, TEXT, JSONB);

CREATE OR REPLACE FUNCTION update_expense_with_shares(
  p_expense_id UUID,
  p_title TEXT,
  p_amount NUMERIC,
  p_paid_by UUID,
  p_split_type TEXT,
  p_category TEXT,
  p_notes TEXT,
  p_shares JSONB,
  p_expense_date DATE,
  p_description TEXT,
  p_tags TEXT[],
  p_currency TEXT,
  p_exchange_rate NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_expense expenses%ROWTYPE;
BEGIN
  UPDATE expenses
  SET
    title = p_title,
    amount = p_amount,
    paid_by = p_paid_by,
    split_type = p_split_type,
    category = p_category,
    notes = p_notes,
    expense_date = COALESCE(p_expense_date, expense_date),
    description = p_description,
    tags = p_tags,
    currency = COALESCE(p_currency, currency),
    exchange_rate = COALESCE(p_exchange_rate, exchange_rate),
    updated_at = now()
  WHERE id = p_expense_id
  RETURNING * INTO v_expense;

  IF v_expense.id IS NULL THEN
    RAISE EXCEPTION 'Expense not found';
  END IF;

  DELETE FROM expense_shares WHERE expense_id = p_expense_id;

  INSERT INTO expense_shares (expense_id, user_id, share_amount, paid_amount)
  SELECT
    p_expense_id,
    s.user_id,
    s.share_amount,
    COALESCE(s.paid_amount, 0)
  FROM jsonb_to_recordset(p_shares) AS s(
    user_id UUID,
    share_amount NUMERIC,
    paid_amount NUMERIC
  );

  RETURN to_jsonb(v_expense);
END;
$$;

DROP FUNCTION IF EXISTS delete_expense_with_shares(UUID);

CREATE OR REPLACE FUNCTION delete_expense_with_shares(
  p_expense_id UUID,
  p_trip_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM expenses
    WHERE id = p_expense_id AND trip_id = p_trip_id
  ) INTO v_exists;

  IF NOT v_exists THEN
    RAISE EXCEPTION 'Expense not found for trip';
  END IF;

  DELETE FROM expense_shares WHERE expense_id = p_expense_id;
  DELETE FROM expenses WHERE id = p_expense_id AND trip_id = p_trip_id;
END;
$$;
