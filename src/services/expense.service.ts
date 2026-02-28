// ============================================
// Expense Service
// ============================================

import { supabase } from '@/lib/supabase';
import { CreateExpenseRequest, Expense } from '@/types';
import { calculateSplitShares } from '@/utils/splitCalculator';

/**
 * Create an expense
 */
export async function createExpense(
  data: CreateExpenseRequest
): Promise<{ expense: Expense | null; error: string | null }> {
  try {
    // Create expense
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        trip_id: data.trip_id,
        title: data.title,
        amount: data.amount,
        paid_by: data.paid_by,
        split_type: data.split_type,
        category: data.category,
      })
      .select()
      .single();

    if (expenseError || !expense) {
      return { expense: null, error: expenseError?.message || 'Failed to create expense' };
    }

    // Create expense shares
    const shares = data.shares.map(share => ({
      expense_id: expense.id,
      user_id: share.user_id,
      share_amount: share.amount,
    }));

    const { error: sharesError } = await supabase
      .from('expense_shares')
      .insert(shares);

    if (sharesError) {
      // Clean up
      await supabase.from('expenses').delete().eq('id', expense.id);
      return { expense: null, error: 'Failed to create expense shares' };
    }

    return { expense, error: null };
  } catch (error) {
    console.error('Error creating expense:', error);
    return { expense: null, error: 'Internal server error' };
  }
}

/**
 * Get expense with shares
 */
export async function getExpense(expenseId: string) {
  try {
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .select(
        `
        *,
        users!paid_by(id, name, email, profile_image),
        expense_shares(id, user_id, share_amount, users(id, name, email, profile_image))
      `
      )
      .eq('id', expenseId)
      .single();

    if (expenseError || !expense) {
      return { expense: null, error: 'Expense not found' };
    }

    return { expense, error: null };
  } catch (error) {
    console.error('Error fetching expense:', error);
    return { expense: null, error: 'Failed to fetch expense' };
  }
}

/**
 * Get all expenses for a trip
 */
export async function getTripExpenses(tripId: string) {
  try {
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select(
        `
        *,
        users!paid_by(id, name, email, profile_image),
        expense_shares(id, user_id, share_amount, users(id, name, email, profile_image))
      `
      )
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false });

    if (error) {
      return { expenses: [], error: error.message };
    }

    return { expenses: expenses || [], error: null };
  } catch (error) {
    console.error('Error fetching trip expenses:', error);
    return { expenses: [], error: 'Failed to fetch expenses' };
  }
}

/**
 * Update expense
 */
export async function updateExpense(
  expenseId: string,
  data: Partial<CreateExpenseRequest>
) {
  try {
    const { data: expense, error } = await supabase
      .from('expenses')
      .update({
        title: data.title,
        amount: data.amount,
        paid_by: data.paid_by,
        split_type: data.split_type,
        category: data.category,
      })
      .eq('id', expenseId)
      .select()
      .single();

    if (error) {
      return { expense: null, error: error.message };
    }

    // Update shares if provided
    if (data.shares) {
      // Delete old shares
      await supabase.from('expense_shares').delete().eq('expense_id', expenseId);

      // Insert new shares
      const shares = data.shares.map(share => ({
        expense_id: expenseId,
        user_id: share.user_id,
        share_amount: share.amount,
      }));

      const { error: sharesError } = await supabase
        .from('expense_shares')
        .insert(shares);

      if (sharesError) {
        return { expense: null, error: 'Failed to update expense shares' };
      }
    }

    return { expense, error: null };
  } catch (error) {
    console.error('Error updating expense:', error);
    return { expense: null, error: 'Failed to update expense' };
  }
}

/**
 * Delete expense
 */
export async function deleteExpense(expenseId: string) {
  try {
    // Shares will be deleted via CASCADE
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error deleting expense:', error);
    return { error: 'Failed to delete expense' };
  }
}

/**
 * Get user expenses in trip (what they paid and what they owe)
 */
export async function getUserExpenses(tripId: string, userId: string) {
  try {
    // Expenses paid by user
    const { data: paid, error: paidError } = await supabase
      .from('expenses')
      .select('*')
      .eq('trip_id', tripId)
      .eq('paid_by', userId);

    // Shares where user owes
    const { data: owes, error: owesError } = await supabase
      .from('expense_shares')
      .select(
        `
        *,
        expenses(id, trip_id, title, amount, paid_by, split_type, category, created_at)
      `
      )
      .eq('user_id', userId);

    if (paidError || owesError) {
      return { paid: [], owes: [], error: 'Failed to fetch user expenses' };
    }

    return { paid: paid || [], owes: owes || [], error: null };
  } catch (error) {
    console.error('Error fetching user expenses:', error);
    return { paid: [], owes: [], error: 'Failed to fetch user expenses' };
  }
}
