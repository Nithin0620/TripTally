import { NextRequest } from 'next/server';
import {
  authenticateRequest,
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api-helpers';
import * as expenseService from '@/services/expenseService';
import * as tripService from '@/services/tripService';

interface RouteContext {
  params: {
    tripId: string;
    expenseId: string;
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
 * POST /api/trips/[tripId]/expenses/[expenseId]/shares - Add expense share (editor/owner only)
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return unauthorizedResponse('Missing or invalid token');
    }

    const userRole = await getUserTripRole(params.tripId, user.id);
    if (!['owner', 'editor'].includes(userRole || '')) {
      return forbiddenResponse('Insufficient permissions to add expense shares');
    }

    const { user_id, share_amount } = await request.json();

    if (!user_id || share_amount === undefined) {
      return badRequestResponse('Missing required fields: user_id, share_amount');
    }

    const share = await expenseService.addExpenseShare(params.expenseId, user_id, share_amount);
    return successResponse(share, 'Expense share added', 201);
  } catch (error) {
    console.error('Add expense share error:', error);
    return serverErrorResponse('Failed to add expense share');
  }
}

/**
 * GET /api/trips/[tripId]/expenses/[expenseId]/shares - Get shares for expense
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

    const shares = await expenseService.getExpenseShares(params.expenseId);
    return successResponse(shares);
  } catch (error) {
    console.error('Get expense shares error:', error);
    return serverErrorResponse('Failed to fetch expense shares');
  }
}
