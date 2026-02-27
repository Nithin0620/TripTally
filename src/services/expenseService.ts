import { supabaseAdmin } from '../config/supabase';

/**
 * Service for expense-related database operations
 */

export interface CreateExpenseInput {
  trip_id: string;
  title: string;
  amount: number;
  paid_by: string;
  split_type: 'equal' | 'percentage' | 'custom';
  category?: string;
}

export interface Expense {
  id: string;
  trip_id: string;
  title: string;
  amount: number;
  paid_by: string;
  split_type: string;
  category: string | null;
  created_at: string;
}

export interface ExpenseShare {
  id: string;
  expense_id: string;
  user_id: string;
  share_amount: number;
}

/**
 * Create expense
 */
export const createExpense = async (input: CreateExpenseInput): Promise<Expense> => {
  const { data, error } = await supabaseAdmin
    .from('expenses')
    .insert([input])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create expense: ${error.message}`);
  }

  return data;
};

/**
 * Get expense by ID
 */
export const getExpenseById = async (expenseId: string): Promise<Expense | null> => {
  const { data, error } = await supabaseAdmin
    .from('expenses')
    .select('*')
    .eq('id', expenseId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch expense: ${error.message}`);
  }

  return data;
};

/**
 * Get all expenses for a trip
 */
export const getTripExpenses = async (tripId: string): Promise<Expense[]> => {
  const { data, error } = await supabaseAdmin
    .from('expenses')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch expenses: ${error.message}`);
  }

  return data || [];
};

/**
 * Update expense
 */
export const updateExpense = async (
  expenseId: string,
  updates: Partial<Omit<Expense, 'id' | 'trip_id' | 'created_at'>>
): Promise<Expense> => {
  const { data, error } = await supabaseAdmin
    .from('expenses')
    .update(updates)
    .eq('id', expenseId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update expense: ${error.message}`);
  }

  return data;
};

/**
 * Delete expense
 */
export const deleteExpense = async (expenseId: string): Promise<void> => {
  const { error } = await supabaseAdmin.from('expenses').delete().eq('id', expenseId);

  if (error) {
    throw new Error(`Failed to delete expense: ${error.message}`);
  }
};

/**
 * Add expense share
 */
export const addExpenseShare = async (
  expenseId: string,
  userId: string,
  shareAmount: number
): Promise<ExpenseShare> => {
  const { data, error } = await supabaseAdmin
    .from('expense_shares')
    .insert([{ expense_id: expenseId, user_id: userId, share_amount: shareAmount }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add expense share: ${error.message}`);
  }

  return data;
};

/**
 * Get expense shares
 */
export const getExpenseShares = async (expenseId: string): Promise<ExpenseShare[]> => {
  const { data, error } = await supabaseAdmin
    .from('expense_shares')
    .select('*')
    .eq('expense_id', expenseId);

  if (error) {
    throw new Error(`Failed to fetch expense shares: ${error.message}`);
  }

  return data || [];
};

/**
 * Update expense share
 */
export const updateExpenseShare = async (
  shareId: string,
  shareAmount: number
): Promise<ExpenseShare> => {
  const { data, error } = await supabaseAdmin
    .from('expense_shares')
    .update({ share_amount: shareAmount })
    .eq('id', shareId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update expense share: ${error.message}`);
  }

  return data;
};

/**
 * Delete expense shares for an expense
 */
export const deleteExpenseShares = async (expenseId: string): Promise<void> => {
  const { error } = await supabaseAdmin
    .from('expense_shares')
    .delete()
    .eq('expense_id', expenseId);

  if (error) {
    throw new Error(`Failed to delete expense shares: ${error.message}`);
  }
};

/**
 * Get expense settlements (who owes whom)
 */
export const getExpenseSettlements = async (tripId: string) => {
  const { data, error } = await supabaseAdmin
    .from('expenses')
    .select(`
      id,
      amount,
      paid_by,
      expense_shares (
        user_id,
        share_amount
      )
    `)
    .eq('trip_id', tripId);

  if (error) {
    throw new Error(`Failed to fetch expense settlements: ${error.message}`);
  }

  return data || [];
};
