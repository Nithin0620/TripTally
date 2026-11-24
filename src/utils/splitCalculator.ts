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

export type SplitType = 'equal' | 'percentage' | 'custom' | 'shares';

export interface SplitCalculatorInput {
  amount: number;
  paidByUserId: string;
  splitType: SplitType;
  involvedMembers: string[]; // User IDs involved in this split
  percentages?: Record<string, number>;
  customShares?: Record<string, number>;
  shareCounts?: Record<string, number>;
}

export interface SplitCalculatorOutput {
  breakdown: SplitBreakdown[];
  totalAmount: number;
  errors: string[];
  isValid: boolean;
}

const CENTS_PRECISION = 100;
const PERCENT_PRECISION = 10000; // basis points (2 decimal places)

function toCents(value: number): number {
  return Math.round(value * CENTS_PRECISION);
}

function fromCents(value: number): number {
  return value / CENTS_PRECISION;
}

function isValidNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

/**
 * Validate split inputs
 */
function validateSplitInput(input: SplitCalculatorInput): string[] {
  const errors: string[] = [];

  if (typeof input.amount !== 'number' || !Number.isFinite(input.amount) || input.amount <= 0) {
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
      const percentValues = Object.values(input.percentages);
      if (percentValues.some(value => !isValidNonNegativeNumber(value))) {
        errors.push('Percentages must be valid non-negative numbers');
      }
      for (const userId of input.involvedMembers) {
        if (!(userId in input.percentages)) {
          errors.push(`Missing percentage for member ${userId}`);
        }
      }
      const percentageSum = input.involvedMembers.reduce((sum, userId) => {
        return sum + Math.round((input.percentages?.[userId] || 0) * PERCENT_PRECISION);
      }, 0);
      if (percentageSum !== 100 * PERCENT_PRECISION) {
        errors.push('Percentages must sum to exactly 100');
      }
    }
  }

  if (input.splitType === 'custom') {
    if (!input.customShares) {
      errors.push('Custom shares must be provided for custom splits');
    } else {
      const shareValues = Object.values(input.customShares);
      if (shareValues.some(value => !isValidNonNegativeNumber(value))) {
        errors.push('Custom shares must be valid non-negative numbers');
      }
      for (const userId of input.involvedMembers) {
        if (!(userId in input.customShares)) {
          errors.push(`Missing custom share for member ${userId}`);
        }
      }
      const customSumCents = input.involvedMembers.reduce((sum, userId) => {
        return sum + toCents(input.customShares?.[userId] || 0);
      }, 0);
      if (customSumCents !== toCents(input.amount)) {
        errors.push('Custom shares must sum to total amount');
      }
    }
  }

  if (input.splitType === 'shares') {
    if (!input.shareCounts) {
      errors.push('Share counts must be provided for shares splits');
    } else {
      const counts = input.involvedMembers.map(userId => input.shareCounts?.[userId]);
      if (counts.some(value => !isValidNonNegativeNumber(value))) {
        errors.push('Share counts must be valid non-negative numbers');
      }
      for (const userId of input.involvedMembers) {
        if (!(userId in input.shareCounts!)) {
          errors.push(`Missing share count for member ${userId}`);
        }
      }
      const total = counts.reduce<number>((sum, value) => sum + (value || 0), 0);
      if (total <= 0) {
        errors.push('At least one share count must be greater than zero');
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
  const totalCents = toCents(amount);
  const memberCount = involvedMembers.length;
  const baseShareCents = Math.floor(totalCents / memberCount);
  const remainder = totalCents % memberCount;

  return involvedMembers.map((userId, index) => {
    const shareCents = baseShareCents + (index < remainder ? 1 : 0);
    const share = fromCents(shareCents);
    const paid = userId === paidByUserId ? amount : 0;
    const owes = share - paid;

    return {
      userId,
      share,
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
  const totalCents = toCents(amount);
  const provisional = involvedMembers.map((userId) => {
    const percentage = percentages[userId] || 0;
    const rawCents = (totalCents * percentage) / 100;
    const flooredCents = Math.floor(rawCents);
    const remainder = rawCents - flooredCents;
    return { userId, flooredCents, remainder };
  });
  const flooredSum = provisional.reduce((sum, item) => sum + item.flooredCents, 0);
  let remainingCents = totalCents - flooredSum;

  const sortedByRemainder = [...provisional].sort((a, b) => b.remainder - a.remainder);
  const finalShareCents: Record<string, number> = {};
  provisional.forEach(item => {
    finalShareCents[item.userId] = item.flooredCents;
  });
  for (let i = 0; i < remainingCents; i += 1) {
    const targetUser = sortedByRemainder[i % sortedByRemainder.length]?.userId;
    if (targetUser) finalShareCents[targetUser] += 1;
  }

  return involvedMembers.map((userId) => {
    const share = fromCents(finalShareCents[userId] || 0);
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
    const share = fromCents(toCents(customShares[userId] || 0));
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

function calculateSharesSplit(
  amount: number,
  paidByUserId: string,
  involvedMembers: string[],
  shareCounts: Record<string, number>
): SplitBreakdown[] {
  const totalCents = toCents(amount);
  const totalShares = involvedMembers.reduce((sum, userId) => sum + (shareCounts[userId] || 0), 0);
  const provisional = involvedMembers.map(userId => {
    const rawCents = (totalCents * (shareCounts[userId] || 0)) / totalShares;
    const flooredCents = Math.floor(rawCents);
    return { userId, flooredCents, remainder: rawCents - flooredCents };
  });
  const flooredSum = provisional.reduce((sum, item) => sum + item.flooredCents, 0);
  let remainingCents = totalCents - flooredSum;

  const sortedByRemainder = [...provisional].sort((a, b) => b.remainder - a.remainder);
  const finalShareCents: Record<string, number> = {};
  provisional.forEach(item => {
    finalShareCents[item.userId] = item.flooredCents;
  });
  for (let i = 0; i < remainingCents; i += 1) {
    const targetUser = sortedByRemainder[i % sortedByRemainder.length]?.userId;
    if (targetUser) finalShareCents[targetUser] += 1;
  }

  return involvedMembers.map(userId => {
    const share = fromCents(finalShareCents[userId] || 0);
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

      case 'shares':
        breakdown = calculateSharesSplit(
          input.amount,
          input.paidByUserId,
          input.involvedMembers,
          input.shareCounts!
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
