-- ============================================
-- EXPENSE TRANSACTION FUNCTIONS
-- ============================================
-- Run this migration in Supabase SQL editor.
-- Each function executes in a single DB transaction.

CREATE OR REPLACE FUNCTION create_expense_with_shares(
  p_trip_id UUID,
  p_title TEXT,
  p_amount NUMERIC,
  p_paid_by UUID,
  p_split_type TEXT,
  p_notes TEXT,
  p_category TEXT,
  p_created_by UUID,
  p_shares JSONB
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
    created_by
  )
  VALUES (
    p_trip_id,
    p_title,
    p_amount,
    p_paid_by,
    p_split_type,
    p_notes,
    COALESCE(p_category, 'general'),
    p_created_by
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

CREATE OR REPLACE FUNCTION update_expense_with_shares(
  p_expense_id UUID,
  p_title TEXT,
  p_amount NUMERIC,
  p_paid_by UUID,
  p_split_type TEXT,
  p_category TEXT,
  p_notes TEXT,
  p_shares JSONB
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

CREATE OR REPLACE FUNCTION delete_expense_with_shares(
  p_expense_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM expense_shares WHERE expense_id = p_expense_id;
  DELETE FROM expenses WHERE id = p_expense_id;
END;
$$;
