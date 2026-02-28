// ============================================
// Split Calculator Utility
// ============================================

/**
 * Calculate per-user expense shares for different split types
 */
export function calculateSplitShares(
  totalAmount: number,
  participants: string[],
  splitType: 'equal' | 'percentage' | 'custom',
  customSplits?: Record<string, number>
): Record<string, number> {
  const shares: Record<string, number> = {};

  if (splitType === 'equal') {
    // Equal split among participants
    const sharePerPerson = totalAmount / participants.length;
    for (const participant of participants) {
      shares[participant] = Math.round(sharePerPerson * 100) / 100;
    }
  } else if (splitType === 'percentage') {
    // Percentage-based split
    if (!customSplits) throw new Error('Custom splits required for percentage split');

    for (const participant of participants) {
      const percentage = customSplits[participant] || 0;
      shares[participant] = Math.round((totalAmount * percentage) / 100 * 100) / 100;
    }
  } else if (splitType === 'custom') {
    // Custom amounts
    if (!customSplits) throw new Error('Custom splits required for custom split');

    for (const participant of participants) {
      shares[participant] = customSplits[participant] || 0;
    }
  }

  return shares;
}

/**
 * Calculate balance for each user in a trip
 * Positive balance means they are owed money
 * Negative balance means they owe money
 */
export function calculateUserBalances(
  expenses: Array<{
    id: string;
    paid_by: string;
    amount: number;
    shares: Record<string, number>;
  }>,
  tripMembers: string[]
): Record<string, number> {
  const balances: Record<string, number> = {};

  // Initialize all users with 0 balance
  for (const member of tripMembers) {
    balances[member] = 0;
  }

  // Process each expense
  for (const expense of expenses) {
    // Add amount to the person who paid
    balances[expense.paid_by] += expense.amount;

    // Subtract shares from each participant
    for (const [userId, share] of Object.entries(expense.shares)) {
      balances[userId] -= share;
    }
  }

  return balances;
}

/**
 * Get detailed balance breakdown for a user
 */
export function getUserBalanceDetails(
  userId: string,
  expenses: Array<{
    id: string;
    paid_by: string;
    title: string;
    amount: number;
    shares: Record<string, number>;
  }>
) {
  let totalPaid = 0;
  let totalOwes = 0;
  const expenseBreakdown: Array<{
    expenseId: string;
    title: string;
    type: 'paid' | 'owes';
    amount: number;
  }> = [];

  for (const expense of expenses) {
    if (expense.paid_by === userId) {
      // User paid this expense
      totalPaid += expense.amount;
      expenseBreakdown.push({
        expenseId: expense.id,
        title: expense.title,
        type: 'paid',
        amount: expense.amount,
      });
    }

    if (expense.shares[userId]) {
      // User owes a share of this expense
      const shareAmount = expense.shares[userId];
      totalOwes += shareAmount;
      expenseBreakdown.push({
        expenseId: expense.id,
        title: expense.title,
        type: 'owes',
        amount: shareAmount,
      });
    }
  }

  return {
    userId,
    totalPaid,
    totalOwes,
    balance: totalPaid - totalOwes, // Positive = owed, negative = owes
    expenseBreakdown,
  };
}
