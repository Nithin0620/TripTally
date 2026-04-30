// ============================================
// Expense Service
// ============================================

import { supabase } from '@/lib/supabase';
import { CreateExpenseRequest, Expense } from '@/types';
import { calculateSplit, sumUpMemberBalances, SplitCalculatorInput } from '@/utils/splitCalculator';
import { optimizeSettlements } from '@/utils/settlementOptimizer';

/**
 * Create an expense with validated split calculation
 * Validates split input before database insert to ensure financial accuracy
 */
export async function createExpenseWithSplit(
  tripId: string,
  title: string,
  amount: number,
  paidByUserId: string,
  splitType: 'equal' | 'percentage' | 'custom',
  involvedMembers: string[],
  percentages?: Record<string, number>,
  customShares?: Record<string, number>,
  notes?: string,
  category?: string
): Promise<{ data: any; error: string | null }> {
  try {
    if (!tripId || !title || !paidByUserId || amount <= 0) {
      return {
        data: null,
        error: 'Invalid expense parameters: trip ID, title, payer, and amount > 0 required',
      };
    }

    // Validate that payer is in involved members
    if (!involvedMembers.includes(paidByUserId)) {
      involvedMembers.push(paidByUserId);
    }

    // Use split calculator to validate and compute shares
    const splitInput: SplitCalculatorInput = {
      amount,
      paidByUserId,
      splitType,
      involvedMembers,
      percentages,
      customShares,
    };

    const splitResult = calculateSplit(splitInput);

    // Return validation errors if split is invalid
    if (!splitResult.isValid) {
      return {
        data: null,
        error: `Split validation failed: ${splitResult.errors.join('; ')}`,
      };
    }

    // Create expense in database
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        trip_id: tripId,
        title,
        amount: splitResult.totalAmount,
        paid_by: paidByUserId,
        split_type: splitType,
        notes: notes || null,
        category: category || 'general',
        created_by: paidByUserId,
      })
      .select()
      .single();

    if (expenseError || !expense) {
      return {
        data: null,
        error: expenseError?.message || 'Failed to create expense record',
      };
    }

    // Create expense shares from validated breakdown
    const shares = splitResult.breakdown.map(item => ({
      expense_id: expense.id,
      user_id: item.userId,
      share_amount: item.share,
      paid_amount: item.paid,
    }));

    const { error: sharesError } = await supabase
      .from('expense_shares')
      .insert(shares);

    if (sharesError) {
      // Cleanup on failure
      await supabase.from('expenses').delete().eq('id', expense.id);
      return {
        data: null,
        error: 'Failed to create expense shares',
      };
    }

    return {
      data: {
        expense,
        breakdown: splitResult.breakdown,
        totalAmount: splitResult.totalAmount,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error creating expense with split:', error);
    return {
      data: null,
      error: 'Internal server error while creating expense',
    };
  }
}

/**
 * Create an expense (legacy - direct insertion without validation)
 * Use createExpenseWithSplit for production endpoints
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
 * Calculate trip settlement using greedy algorithm to minimize transactions
 * Returns optimized payment plan to settle all debts
 */
export async function calculateTripSettlement(tripId: string) {
  try {
    // Get all expenses and shares for the trip
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select(
        `
        id,
        trip_id,
        amount,
        paid_by,
        split_type,
        expense_shares(
          user_id,
          share_amount
        )
      `
      )
      .eq('trip_id', tripId);

    if (expensesError || !expenses) {
      return {
        data: null,
        error: 'Failed to fetch trip expenses',
      };
    }

    // Calculate balances for each trip member (positive = owes, negative = owed)
    const balances: Record<string, number> = {};

    expenses.forEach((expense: any) => {
      // Initialize payer in balances if not present
      if (!balances[expense.paid_by]) {
        balances[expense.paid_by] = 0;
      }

      // Add amount paid (creditor)
      balances[expense.paid_by] += expense.amount;

      // Subtract shares owed (debtor)
      expense.expense_shares.forEach((share: any) => {
        if (!balances[share.user_id]) {
          balances[share.user_id] = 0;
        }
        balances[share.user_id] -= share.share_amount;
      });
    });

    // Validate that total is approximately zero (accounting precision)
    const totalBalance = Object.values(balances).reduce((a: number, b: number) => a + b, 0);
    if (Math.abs(totalBalance) > 0.01) {
      return {
        data: null,
        error: `Settlement validation failed: total imbalance is ${totalBalance}`,
      };
    }

    // Use settlement optimizer to get minimal transaction plan
    const settlements = optimizeSettlements(balances);

    // Get user details for display
    const userIds = Object.keys(balances);
    const { data: users } = await supabase
      .from('users')
      .select('id, name, email')
      .in('id', userIds);

    const userMap = new Map(users?.map(u => [u.id, u]) || []);

    // Enrich settlements with user details
    const enrichedSettlements = settlements.map(settlement => ({
      ...settlement,
      from_user: userMap.get(settlement.from_user_id) || { id: settlement.from_user_id },
      to_user: userMap.get(settlement.to_user_id) || { id: settlement.to_user_id },
    }));

    return {
      data: {
        settlements: enrichedSettlements,
        balances,
        expenseCount: expenses.length,
        totalExpensed: Object.values(balances).reduce((a: number, b: number) => Math.abs(a) + Math.abs(b), 0) / 2,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error calculating trip settlement:', error);
    return {
      data: null,
      error: 'Failed to calculate settlement',
    };
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
