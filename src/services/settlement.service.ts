// ============================================
// Settlement Service
// ============================================

import { supabaseAdmin } from '@/lib/supabase';
import { Settlement, User } from '@/types';
import { calculateUserBalances } from '@/utils/splitCalculator';
import { optimizeSettlements, validateSettlement } from '@/utils/settlementOptimizer';

/**
 * Calculate settlements for a trip
 */
export async function calculateTripSettlements(tripId: string) {
  try {
    // Get all trip members
    const { data: members, error: membersError } = await supabaseAdmin
      .from('trip_members')
      .select('user_id, users(id, name, email, profile_image)')
      .eq('trip_id', tripId);

    if (membersError || !members) {
      return { settlements: [], error: 'Failed to fetch trip members' };
    }

    const memberIds = members.map(m => m.user_id);
    const userMap: Record<string, User> = {};

    // Build user map
    for (const member of members) {
      const userData = member.users;
      if (userData && !Array.isArray(userData)) {
        userMap[(userData as any).id] = userData as User;
      }
    }

    // Get all expenses with shares
    const { data: expenses, error: expensesError } = await supabaseAdmin
      .from('expenses')
      .select(
        `
        id,
        paid_by,
        amount,
        expense_shares(user_id, share_amount)
      `
      )
      .eq('trip_id', tripId);

    if (expensesError || !expenses) {
      return { settlements: [], error: 'Failed to fetch expenses' };
    }

    // Calculate balances
    const expenseData = expenses.map(exp => ({
      id: exp.id,
      paid_by: exp.paid_by,
      amount: exp.amount,
      shares: exp.expense_shares.reduce(
        (acc: Record<string, number>, share: any) => {
          acc[share.user_id] = share.share_amount;
          return acc;
        },
        {}
      ),
    }));

    const balances = calculateUserBalances(expenseData, memberIds);

    // Validate settlement
    if (!validateSettlement(balances)) {
      console.warn('Settlement validation failed - balances do not sum to zero');
    }

    // Optimize settlements
    const settlements = optimizeSettlements(balances);

    // Attach user details
    const settlementsWithUsers = settlements.map(settlement => ({
      ...settlement,
      from_user: userMap[settlement.from_user_id],
      to_user: userMap[settlement.to_user_id],
    }));

    return { settlements: settlementsWithUsers, error: null, balances };
  } catch (error) {
    console.error('Error calculating settlements:', error);
    return { settlements: [], error: 'Failed to calculate settlements' };
  }
}

/**
 * Get user balance in a trip
 */
export async function getUserTripBalance(tripId: string, userId: string) {
  try {
    // Get all trip members
    const { data: members } = await supabaseAdmin
      .from('trip_members')
      .select('user_id')
      .eq('trip_id', tripId);

    if (!members) {
      return { balance: 0, error: 'Failed to fetch trip members' };
    }

    const memberIds = members.map(m => m.user_id);

    // Get all expenses
    const { data: expenses, error: expensesError } = await supabaseAdmin
      .from('expenses')
      .select(
        `
        id,
        paid_by,
        amount,
        expense_shares(user_id, share_amount)
      `
      )
      .eq('trip_id', tripId);

    if (expensesError || !expenses) {
      return { balance: 0, error: 'Failed to fetch expenses' };
    }

    // Calculate balances
    const expenseData = expenses.map(exp => ({
      id: exp.id,
      paid_by: exp.paid_by,
      amount: exp.amount,
      shares: exp.expense_shares.reduce(
        (acc: Record<string, number>, share: any) => {
          acc[share.user_id] = share.share_amount;
          return acc;
        },
        {}
      ),
    }));

    const balances = calculateUserBalances(expenseData, memberIds);

    return { balance: balances[userId] || 0, error: null };
  } catch (error) {
    console.error('Error calculating user balance:', error);
    return { balance: 0, error: 'Failed to calculate balance' };
  }
}

/**
 * Get all balances for a trip
 */
export async function getTripBalances(tripId: string) {
  try {
    const { data: members } = await supabaseAdmin
      .from('trip_members')
      .select('user_id')
      .eq('trip_id', tripId);

    if (!members) {
      return { balances: {}, error: 'Failed to fetch trip members' };
    }

    const memberIds = members.map(m => m.user_id);

    const { data: expenses, error: expensesError } = await supabaseAdmin
      .from('expenses')
      .select(
        `
        id,
        paid_by,
        amount,
        expense_shares(user_id, share_amount)
      `
      )
      .eq('trip_id', tripId);

    if (expensesError || !expenses) {
      return { balances: {}, error: 'Failed to fetch expenses' };
    }

    const expenseData = expenses.map(exp => ({
      id: exp.id,
      paid_by: exp.paid_by,
      amount: exp.amount,
      shares: exp.expense_shares.reduce(
        (acc: Record<string, number>, share: any) => {
          acc[share.user_id] = share.share_amount;
          return acc;
        },
        {}
      ),
    }));

    const balances = calculateUserBalances(expenseData, memberIds);

    return { balances, error: null };
  } catch (error) {
    console.error('Error fetching trip balances:', error);
    return { balances: {}, error: 'Failed to fetch balances' };
  }
}
