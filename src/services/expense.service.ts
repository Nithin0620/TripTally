// ============================================
// Expense Service
// ============================================

import { supabaseAdmin } from '@/lib/supabase';
import { CreateExpenseRequest, Expense } from '@/types';
import { calculateSplit, sumUpMemberBalances, SplitCalculatorInput } from '@/utils/splitCalculator';
import { optimizeSettlements } from '@/utils/settlementOptimizer';

interface ExpenseShareInput {
  expense_id?: string;
  user_id: string;
  share_amount: number;
  paid_amount?: number;
}

function hasNegativeShareValues(shares: ExpenseShareInput[]): boolean {
  return shares.some(
    share =>
      !Number.isFinite(share.share_amount) ||
      share.share_amount < 0 ||
      (share.paid_amount !== undefined &&
        (!Number.isFinite(share.paid_amount) || share.paid_amount < 0))
  );
}

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
    if (!tripId || !title || !paidByUserId || !Number.isFinite(amount) || amount <= 0) {
      return {
        data: null,
        error: 'Invalid expense parameters: trip ID, title, payer, and amount > 0 required',
      };
    }

    if (!Array.isArray(involvedMembers) || involvedMembers.length === 0) {
      return {
        data: null,
        error: 'involved_members must not be empty',
      };
    }

    if (!involvedMembers.includes(paidByUserId)) {
      return {
        data: null,
        error: 'paid_by must be part of involved_members',
      };
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

    const shares: ExpenseShareInput[] = splitResult.breakdown.map(item => ({
      user_id: item.userId,
      share_amount: item.share,
      paid_amount: item.paid,
    }));

    if (hasNegativeShareValues(shares)) {
      return {
        data: null,
        error: 'Share values must be valid non-negative numbers',
      };
    }

    // Atomic insert via RPC (single DB transaction)
    const { data: expense, error: expenseError } = await supabaseAdmin.rpc('create_expense_with_shares', {
      p_trip_id: tripId,
      p_title: title,
      p_amount: splitResult.totalAmount,
      p_paid_by: paidByUserId,
      p_split_type: splitType,
      p_notes: notes || null,
      p_category: category || 'general',
      p_created_by: paidByUserId,
      p_shares: shares,
    });

    if (expenseError || !expense) {
      return {
        data: null,
        error: expenseError?.message || 'Failed to create expense record',
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
    const { data: expense, error: expenseError } = await supabaseAdmin
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

    const { error: sharesError } = await supabaseAdmin
      .from('expense_shares')
      .insert(shares);

    if (sharesError) {
      // Clean up
      await supabaseAdmin.from('expenses').delete().eq('id', expense.id);
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
    const { data: expense, error: expenseError } = await supabaseAdmin
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
export async function getTripExpenses(tripId: string, limit?: number, offset?: number) {
  try {
    const resolvedLimit = typeof limit === 'number' ? limit : 20;
    const resolvedOffset = typeof offset === 'number' ? offset : 0;
    const from = Math.max(0, resolvedOffset);
    const to = from + Math.max(1, resolvedLimit) - 1;

    const { data: expenses, error, count } = await supabaseAdmin
      .from('expenses')
      .select(
        `
        *,
        users!paid_by(id, name, email, profile_image),
        expense_shares(id, user_id, share_amount, users(id, name, email, profile_image))
      `,
        { count: 'exact' }
      )
      .eq('trip_id', tripId)
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      return { expenses: [], total: 0, error: error.message };
    }

    return { expenses: expenses || [], total: count || 0, error: null };
  } catch (error) {
    console.error('Error fetching trip expenses:', error);
    return { expenses: [], total: 0, error: 'Failed to fetch expenses' };
  }
}

/**
 * Calculate trip settlement using greedy algorithm to minimize transactions
 * Returns optimized payment plan to settle all debts
 */
export async function calculateTripSettlement(tripId: string) {
  try {
    // Get all expenses and shares for the trip
    const { data: expenses, error: expensesError } = await supabaseAdmin
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
    const { data: users } = await supabaseAdmin
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
  data: Partial<CreateExpenseRequest> & {
    notes?: string;
    involved_members?: string[];
    percentages?: Record<string, number>;
    custom_shares?: Record<string, number>;
  }
) {
  try {
    const { data: existingExpense, error: fetchError } = await supabaseAdmin
      .from('expenses')
      .select('id, trip_id, title, amount, paid_by, split_type, category, notes')
      .eq('id', expenseId)
      .single();

    if (fetchError || !existingExpense) {
      return { expense: null, error: fetchError?.message || 'Expense not found' };
    }

    const { data: existingShares, error: shareFetchError } = await supabaseAdmin
      .from('expense_shares')
      .select('user_id, share_amount')
      .eq('expense_id', expenseId);

    if (shareFetchError) {
      return { expense: null, error: shareFetchError.message };
    }

    const mergedAmount = data.amount ?? existingExpense.amount;
    const mergedPaidBy = data.paid_by ?? existingExpense.paid_by;
    const mergedSplitType = data.split_type ?? existingExpense.split_type;
    const mergedInvolvedMembers =
      data.involved_members && data.involved_members.length > 0
        ? data.involved_members
        : (existingShares || []).map(share => share.user_id);

    const derivedCustomShares =
      data.custom_shares ??
      (data.shares
        ? Object.fromEntries(data.shares.map(share => [share.user_id, share.amount]))
        : Object.fromEntries((existingShares || []).map(share => [share.user_id, share.share_amount])));

    if (!Array.isArray(mergedInvolvedMembers) || mergedInvolvedMembers.length === 0) {
      return { expense: null, error: 'involved_members must not be empty' };
    }

    if (!mergedInvolvedMembers.includes(mergedPaidBy)) {
      return { expense: null, error: 'paid_by must be part of involved_members' };
    }

    const splitInput: SplitCalculatorInput = {
      amount: mergedAmount,
      paidByUserId: mergedPaidBy,
      splitType: mergedSplitType,
      involvedMembers: mergedInvolvedMembers,
      percentages: data.percentages,
      customShares: mergedSplitType === 'custom' ? derivedCustomShares : data.custom_shares,
    };

    const splitResult = calculateSplit(splitInput);
    if (!splitResult.isValid) {
      return { expense: null, error: `Split validation failed: ${splitResult.errors.join('; ')}` };
    }

    const shares: ExpenseShareInput[] = splitResult.breakdown.map(item => ({
      user_id: item.userId,
      share_amount: item.share,
      paid_amount: item.paid,
    }));

    if (hasNegativeShareValues(shares)) {
      return { expense: null, error: 'Share values must be valid non-negative numbers' };
    }

    const { data: expense, error: updateError } = await supabaseAdmin.rpc('update_expense_with_shares', {
      p_expense_id: expenseId,
      p_title: data.title ?? existingExpense.title,
      p_amount: splitResult.totalAmount,
      p_paid_by: mergedPaidBy,
      p_split_type: mergedSplitType,
      p_category: data.category ?? existingExpense.category ?? 'general',
      p_notes: data.notes ?? existingExpense.notes ?? null,
      p_shares: shares,
    });

    if (updateError || !expense) {
      return { expense: null, error: updateError?.message || 'Failed to update expense' };
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
    const { error } = await supabaseAdmin.rpc('delete_expense_with_shares', {
      p_expense_id: expenseId,
    });

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
    const { data: paid, error: paidError } = await supabaseAdmin
      .from('expenses')
      .select('*')
      .eq('trip_id', tripId)
      .eq('paid_by', userId);

    // Shares where user owes
    const { data: owes, error: owesError } = await supabaseAdmin
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
