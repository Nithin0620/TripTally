// ============================================
// Split Calculator Utility - Production Grade
// Financial logic for expense splitting
// ============================================

export interface SplitBreakdown {
  userId: string;
  share: number; // Amount they should pay
  paid: number;  // Amount they actually paid
  owes: number;  // Net amount they owe (positive) or are owed (negative)
}

export interface SplitCalculatorInput {
  amount: number;
  paidByUserId: string;
  splitType: 'equal' | 'percentage' | 'custom';
  involvedMembers: string[]; // User IDs involved in this split
  percentages?: Record<string, number>;
  customShares?: Record<string, number>;
}

export interface SplitCalculatorOutput {
  breakdown: SplitBreakdown[];
  totalAmount: number;
  errors: string[];
  isValid: boolean;
}

/**
 * Validate split inputs
 */
function validateSplitInput(input: SplitCalculatorInput): string[] {
  const errors: string[] = [];

  if (input.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }

  if (!input.paidByUserId) {
    errors.push('Payer must be specified');
  }

  if (!input.involvedMembers || input.involvedMembers.length === 0) {
    errors.push('At least one member must be involved in the split');
  }

  if (!input.involvedMembers.includes(input.paidByUserId)) {
    errors.push('Payer must be included in involved members');
  }

  if (input.splitType === 'percentage') {
    if (!input.percentages) {
      errors.push('Percentages must be provided for percentage splits');
    } else {
      const percentageSum = Object.values(input.percentages).reduce((a, b) => a + b, 0);
      if (Math.abs(percentageSum - 100) > 0.01) {
        errors.push(`Percentages must sum to 100, got ${percentageSum.toFixed(2)}`);
      }

      for (const userId of input.involvedMembers) {
        if (!(userId in input.percentages)) {
          errors.push(`Missing percentage for member ${userId}`);
        }
      }
    }
  }

  if (input.splitType === 'custom') {
    if (!input.customShares) {
      errors.push('Custom shares must be provided for custom splits');
    } else {
      const customSum = Object.values(input.customShares).reduce((a, b) => a + b, 0);
      const tolerance = 0.01;
      if (Math.abs(customSum - input.amount) > tolerance) {
        errors.push(`Custom shares must sum to ${input.amount}, got ${customSum.toFixed(2)}`);
      }

      for (const userId of input.involvedMembers) {
        if (!(userId in input.customShares)) {
          errors.push(`Missing custom share for member ${userId}`);
        }
      }
    }
  }

  return errors;
}

/**
 * Calculate split breakdown for equal splits
 */
function calculateEqualSplit(
  amount: number,
  paidByUserId: string,
  involvedMembers: string[]
): SplitBreakdown[] {
  const sharePerPerson = amount / involvedMembers.length;
  const tolerance = 0.01;

  return involvedMembers.map((userId) => {
    const paid = userId === paidByUserId ? amount : 0;
    const share = sharePerPerson;
    const owes = Math.abs(share - paid) < tolerance ? 0 : share - paid;

    return {
      userId,
      share: Math.round(share * 100) / 100,
      paid,
      owes: Math.round(owes * 100) / 100,
    };
  });
}

/**
 * Calculate split breakdown for percentage-based splits
 */
function calculatePercentageSplit(
  amount: number,
  paidByUserId: string,
  involvedMembers: string[],
  percentages: Record<string, number>
): SplitBreakdown[] {
  return involvedMembers.map((userId) => {
    const percentage = percentages[userId] || 0;
    const share = (amount * percentage) / 100;
    const paid = userId === paidByUserId ? amount : 0;
    const owes = share - paid;

    return {
      userId,
      share: Math.round(share * 100) / 100,
      paid,
      owes: Math.round(owes * 100) / 100,
    };
  });
}

/**
 * Calculate split breakdown for custom amount splits
 */
function calculateCustomSplit(
  amount: number,
  paidByUserId: string,
  involvedMembers: string[],
  customShares: Record<string, number>
): SplitBreakdown[] {
  return involvedMembers.map((userId) => {
    const share = customShares[userId] || 0;
    const paid = userId === paidByUserId ? amount : 0;
    const owes = share - paid;

    return {
      userId,
      share: Math.round(share * 100) / 100,
      paid,
      owes: Math.round(owes * 100) / 100,
    };
  });
}

/**
 * Main split calculator function
 */
export function calculateSplit(input: SplitCalculatorInput): SplitCalculatorOutput {
  const validationErrors = validateSplitInput(input);

  if (validationErrors.length > 0) {
    return {
      breakdown: [],
      totalAmount: input.amount,
      errors: validationErrors,
      isValid: false,
    };
  }

  let breakdown: SplitBreakdown[];

  try {
    switch (input.splitType) {
      case 'equal':
        breakdown = calculateEqualSplit(input.amount, input.paidByUserId, input.involvedMembers);
        break;

      case 'percentage':
        breakdown = calculatePercentageSplit(
          input.amount,
          input.paidByUserId,
          input.involvedMembers,
          input.percentages!
        );
        break;

      case 'custom':
        breakdown = calculateCustomSplit(
          input.amount,
          input.paidByUserId,
          input.involvedMembers,
          input.customShares!
        );
        break;

      default:
        return {
          breakdown: [],
          totalAmount: input.amount,
          errors: [`Unknown split type: ${input.splitType}`],
          isValid: false,
        };
    }

    return {
      breakdown,
      totalAmount: input.amount,
      errors: [],
      isValid: true,
    };
  } catch (error) {
    return {
      breakdown: [],
      totalAmount: input.amount,
      errors: [error instanceof Error ? error.message : 'Unknown calculation error'],
      isValid: false,
    };
  }
}

/**
 * Get total expenses per member across multiple expenses
 */
export function sumUpMemberBalances(allBreakdowns: SplitBreakdown[][]): Record<string, SplitBreakdown> {
  const memberBalances: Record<string, SplitBreakdown> = {};

  for (const breakdown of allBreakdowns) {
    for (const split of breakdown) {
      if (!memberBalances[split.userId]) {
        memberBalances[split.userId] = {
          userId: split.userId,
          share: 0,
          paid: 0,
          owes: 0,
        };
      }

      memberBalances[split.userId].share += split.share;
      memberBalances[split.userId].paid += split.paid;
      memberBalances[split.userId].owes += split.owes;
    }
  }

  Object.values(memberBalances).forEach((member) => {
    member.share = Math.round(member.share * 100) / 100;
    member.paid = Math.round(member.paid * 100) / 100;
    member.owes = Math.round(member.owes * 100) / 100;
  });

  return memberBalances;
}

/**
 * Backwards-compatible helper used by services - calculates net balance per user
 * from expense records. Each expense object should contain: { id, paid_by, amount, shares }
 */
export function calculateUserBalances(
  expenseData: { id: string; paid_by: string; amount: number; shares: Record<string, number> }[],
  memberIds: string[]
): Record<string, number> {
  const balances: Record<string, number> = {};

  // initialize
  for (const id of memberIds) balances[id] = 0;

  for (const expense of expenseData) {
    for (const memberId of memberIds) {
      const paid = expense.paid_by === memberId ? expense.amount : 0;
      const share = expense.shares?.[memberId] || 0;
      balances[memberId] += paid - share;
    }
  }

  // Round to cents
  for (const k of Object.keys(balances)) {
    balances[k] = Math.round(balances[k] * 100) / 100;
  }

  return balances;
}
