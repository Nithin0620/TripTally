// ============================================
// Settlement Optimizer Utility
// ============================================

import { Settlement } from '@/types';

interface UserBalance {
  userId: string;
  balance: number;
}

/**
 * Optimize settlement transactions to minimize number of transfers
 * Uses a greedy algorithm to match debtors with creditors
 */
export function optimizeSettlements(
  balances: Record<string, number>
): Settlement[] {
  // Create list of users who owe money (negative balance) and who are owed (positive balance)
  const debtors: UserBalance[] = [];
  const creditors: UserBalance[] = [];

  for (const [userId, balance] of Object.entries(balances)) {
    if (balance < 0) {
      // User owes money
      debtors.push({ userId, balance: Math.abs(balance) });
    } else if (balance > 0) {
      // User is owed money
      creditors.push({ userId, balance });
    }
  }

  // Sort for deterministic ordering
  debtors.sort((a, b) => b.balance - a.balance);
  creditors.sort((a, b) => b.balance - a.balance);

  const settlements: Settlement[] = [];

  // Match debtors with creditors
  let debtorIdx = 0;
  let creditorIdx = 0;

  while (debtorIdx < debtors.length && creditorIdx < creditors.length) {
    const debtor = debtors[debtorIdx];
    const creditor = creditors[creditorIdx];

    const amount = Math.min(debtor.balance, creditor.balance);

    settlements.push({
      from_user_id: debtor.userId,
      to_user_id: creditor.userId,
      amount: Math.round(amount * 100) / 100, // Round to 2 decimals
    });

    debtor.balance -= amount;
    creditor.balance -= amount;

    if (debtor.balance === 0) debtorIdx++;
    if (creditor.balance === 0) creditorIdx++;
  }

  return settlements;
}

/**
 * Get simplified settlement plan
 * Returns minimum transactions needed to settle all debts
 */
export function getSettlementPlan(
  balances: Record<string, number>,
  userMap?: Record<string, { id: string; name: string; email: string }>
): Settlement[] {
  const settlements = optimizeSettlements(balances);

  // Attach user details if provided
  if (userMap) {
    return settlements.map(settlement => ({
      ...settlement,
      from_user: userMap[settlement.from_user_id],
      to_user: userMap[settlement.to_user_id],
    }));
  }

  return settlements;
}

/**
 * Validate settlement - check if all balances sum to ~0
 */
export function validateSettlement(balances: Record<string, number>): boolean {
  const total = Object.values(balances).reduce((sum, balance) => sum + balance, 0);
  // Allow small rounding error (within 0.01)
  return Math.abs(total) < 0.01;
}

/**
 * Generate settlement summary
 */
export function getSettlementSummary(
  balances: Record<string, number>,
  settlements: Settlement[]
) {
  const totalTransactions = settlements.length;
  const totalAmount = settlements.reduce((sum, s) => sum + s.amount, 0);
  const userCount = Object.keys(balances).length;
  
  const settled = settlements.filter(s => s.amount > 0).length;
  const remaining = Object.values(balances).filter(b => Math.abs(b) > 0.01).length;

  return {
    totalTransactions,
    totalAmount: Math.round(totalAmount * 100) / 100,
    userCount,
    settledCount: settled,
    pendingCount: remaining,
    isValid: validateSettlement(balances),
  };
}
