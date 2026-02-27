import { NextRequest } from 'next/server';
import {
  authenticateRequest,
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
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
 * GET /api/trips/[tripId]/expenses/[expenseId] - Get expense with shares
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

    const expense = await expenseService.getExpenseById(params.expenseId);
    if (!expense) {
      return notFoundResponse('Expense not found');
    }

    const shares = await expenseService.getExpenseShares(params.expenseId);

    return successResponse({
      ...expense,
      shares,
    });
  } catch (error) {
    console.error('Get expense error:', error);
    return serverErrorResponse('Failed to fetch expense');
  }
}

/**
 * PATCH /api/trips/[tripId]/expenses/[expenseId] - Update expense (editor/owner only)
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return unauthorizedResponse('Missing or invalid token');
    }

    const userRole = await getUserTripRole(params.tripId, user.id);
    if (!['owner', 'editor'].includes(userRole || '')) {
      return forbiddenResponse('Insufficient permissions to update expenses');
    }

    const updates = await request.json();
    const expense = await expenseService.updateExpense(params.expenseId, updates);

    return successResponse(expense, 'Expense updated');
  } catch (error) {
    console.error('Update expense error:', error);
    return serverErrorResponse('Failed to update expense');
  }
}

/**
 * DELETE /api/trips/[tripId]/expenses/[expenseId] - Delete expense (editor/owner only)
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return unauthorizedResponse('Missing or invalid token');
    }

    const userRole = await getUserTripRole(params.tripId, user.id);
    if (!['owner', 'editor'].includes(userRole || '')) {
      return forbiddenResponse('Insufficient permissions to delete expenses');
    }

    await expenseService.deleteExpenseShares(params.expenseId);
    await expenseService.deleteExpense(params.expenseId);

    return successResponse(null, 'Expense deleted');
  } catch (error) {
    console.error('Delete expense error:', error);
    return serverErrorResponse('Failed to delete expense');
  }
}
