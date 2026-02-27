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
 * POST /api/trips/[tripId]/expenses - Create expense (editor/owner only)
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return unauthorizedResponse('Missing or invalid token');
    }

    const userRole = await getUserTripRole(params.tripId, user.id);
    if (!['owner', 'editor'].includes(userRole || '')) {
      return forbiddenResponse('Insufficient permissions to create expenses');
    }

    const { title, amount, paid_by, split_type, category } = await request.json();

    if (!title || !amount || !paid_by || !split_type) {
      return badRequestResponse('Missing required fields: title, amount, paid_by, split_type');
    }

    if (!['equal', 'percentage', 'custom'].includes(split_type)) {
      return badRequestResponse('Invalid split_type. Must be: equal, percentage, or custom');
    }

    const expense = await expenseService.createExpense({
      trip_id: params.tripId,
      title,
      amount: parseFloat(amount),
      paid_by,
      split_type,
      category,
    });

    return successResponse(expense, 'Expense created', 201);
  } catch (error) {
    console.error('Create expense error:', error);
    return serverErrorResponse('Failed to create expense');
  }
}

/**
 * GET /api/trips/[tripId]/expenses - Get all expenses for trip
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

    const expenses = await expenseService.getTripExpenses(params.tripId);
    return successResponse(expenses);
  } catch (error) {
    console.error('Get trip expenses error:', error);
    return serverErrorResponse('Failed to fetch expenses');
  }
}
