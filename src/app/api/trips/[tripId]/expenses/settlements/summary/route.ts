import { NextRequest } from 'next/server';
import {
  authenticateRequest,
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
} from '@/lib/api-helpers';
import * as expenseService from '@/services/expenseService';
import * as tripService from '@/services/tripService';

interface RouteContext {
  params: {
    tripId: string;
  };
}

/**
 * Get user's role for a trip
 */
async function getUserTripRole(tripId: string, userId: string): Promise<string | null> {
  const members = await tripService.getTripMembers(tripId);
  const member = members.find((m: any) => m.user_id === userId);
  return member?.role || null;
}

/**
 * GET /api/trips/[tripId]/expenses/settlements/summary - Get expense settlements
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return unauthorizedResponse('Missing or invalid token');
    }

    const userRole = await getUserTripRole(params.tripId, user.id);
    if (!userRole) {
      return forbiddenResponse('You do not have access to this trip');
    }

    const settlements = await expenseService.getExpenseSettlements(params.tripId);

    // Calculate who owes whom
    const balances: Record<string, number> = {};

    settlements.forEach((expense: any) => {
      balances[expense.paid_by] = (balances[expense.paid_by] || 0) + expense.amount;

      if (expense.expense_shares) {
        expense.expense_shares.forEach((share: any) => {
          balances[share.user_id] = (balances[share.user_id] || 0) - share.share_amount;
        });
      }
    });

    return successResponse(balances);
  } catch (error) {
    console.error('Get settlements error:', error);
    return serverErrorResponse('Failed to fetch settlements');
  }
}
