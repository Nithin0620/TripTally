// ============================================
// POST /api/expenses - Create expense
// GET /api/expenses - List trip expenses
// PUT /api/expenses - Update expense
// DELETE /api/expenses - Delete expense
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, badRequestResponse, serverErrorResponse } from '@/middleware/auth';
import { checkTripEditAccess, checkTripViewAccess } from '@/middleware/role';
import { forbiddenResponse } from '@/middleware/auth';
import {
  createExpense,
  getTripExpenses,
  updateExpense,
  deleteExpense,
} from '@/services/expense.service';
import { CreateExpenseRequest } from '@/types';

/**
 * POST /api/expenses - Create expense
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateUser(request);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { trip_id, title, amount, paid_by, split_type, category, shares } = body;

    // Validation
    if (!trip_id || !title || !amount || !paid_by || !split_type || !shares) {
      return badRequestResponse(
        'Missing required fields: trip_id, title, amount, paid_by, split_type, shares'
      );
    }

    // Check edit access
    const { hasAccess, error: roleError } = await checkTripEditAccess(
      auth.user!.userId,
      trip_id
    );

    if (!hasAccess) {
      return forbiddenResponse(roleError ?? undefined);
    }

    const expenseData: CreateExpenseRequest = {
      trip_id,
      title,
      amount: parseFloat(amount),
      paid_by,
      split_type,
      category,
      shares,
    };

    const { expense, error } = await createExpense(expenseData);

    if (error) {
      return serverErrorResponse(error);
    }

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return serverErrorResponse('Failed to create expense');
  }
}

/**
 * GET /api/expenses - List trip expenses
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateUser(request);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get('tripId');

    if (!tripId) {
      return badRequestResponse('Missing required query parameter: tripId');
    }

    // Check view access
    const { hasAccess, error: roleError } = await checkTripViewAccess(
      auth.user!.userId,
      tripId
    );

    if (!hasAccess) {
      return forbiddenResponse(roleError ?? undefined);
    }

    const { expenses, error } = await getTripExpenses(tripId);

    if (error) {
      return serverErrorResponse(error);
    }

    return NextResponse.json({ expenses }, { status: 200 });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return serverErrorResponse('Failed to fetch expenses');
  }
}

/**
 * PUT /api/expenses - Update expense
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateUser(request);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { id, trip_id, title, amount, paid_by, split_type, category, shares } = body;

    // Validation
    if (!id || !trip_id) {
      return badRequestResponse('Missing required fields: id, trip_id');
    }

    // Check edit access
    const { hasAccess, error: roleError } = await checkTripEditAccess(
      auth.user!.userId,
      trip_id
    );

    if (!hasAccess) {
      return forbiddenResponse(roleError ?? undefined);
    }

    const updateData = {
      trip_id,
      ...(title && { title }),
      ...(amount && { amount: parseFloat(amount) }),
      ...(paid_by && { paid_by }),
      ...(split_type && { split_type }),
      ...(category !== undefined && { category }),
      ...(shares && { shares }),
    };

    const { expense, error } = await updateExpense(id, updateData);

    if (error) {
      return serverErrorResponse(error);
    }

    return NextResponse.json({ expense }, { status: 200 });
  } catch (error) {
    console.error('Error updating expense:', error);
    return serverErrorResponse('Failed to update expense');
  }
}

/**
 * DELETE /api/expenses - Delete expense
 */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateUser(request);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { id, trip_id } = body;

    // Validation
    if (!id || !trip_id) {
      return badRequestResponse('Missing required fields: id, trip_id');
    }

    // Check edit access
    const { hasAccess, error: roleError } = await checkTripEditAccess(
      auth.user!.userId,
      trip_id
    );

    if (!hasAccess) {
      return forbiddenResponse(roleError ?? undefined);
    }

    const { error } = await deleteExpense(id);

    if (error) {
      return serverErrorResponse(error);
    }

    return NextResponse.json({ message: 'Expense deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return serverErrorResponse('Failed to delete expense');
  }
}
