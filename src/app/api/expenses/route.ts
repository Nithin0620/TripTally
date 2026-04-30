import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, badRequestResponse, serverErrorResponse } from '@/middleware/auth';
import { checkTripEditAccess, checkTripViewAccess } from '@/middleware/role';
import { forbiddenResponse } from '@/middleware/auth';
import {
  createExpenseWithSplit,
  getTripExpenses,
  updateExpense,
  deleteExpense,
} from '@/services/expense.service';

/**
 * POST /api/expenses - Create expense with validated split calculation
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateUser(request);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const {
      trip_id,
      title,
      amount,
      paid_by,
      split_type,
      involved_members,
      percentages,
      custom_shares,
      notes,
      category,
    } = body;

    // Validation
    const parsedAmount = Number(amount);

    if (
      !trip_id ||
      !title ||
      Number.isNaN(parsedAmount) ||
      !paid_by ||
      !split_type ||
      !involved_members ||
      !Array.isArray(involved_members) ||
      involved_members.length === 0
    ) {
      return badRequestResponse(
        'Missing required fields: trip_id, title, amount, paid_by, split_type, involved_members (array)'
      );
    }

    // Validate split_type
    if (!['equal', 'percentage', 'custom'].includes(split_type)) {
      return badRequestResponse('split_type must be "equal", "percentage", or "custom"');
    }

    // Check edit access
    const { hasAccess, error: roleError } = await checkTripEditAccess(
      auth.user!.userId,
      trip_id
    );

    if (!hasAccess) {
      return forbiddenResponse(roleError ?? undefined);
    }

    // Use new split calculator with validation
    const { data, error } = await createExpenseWithSplit(
      trip_id,
      title,
      parsedAmount,
      paid_by,
      split_type as 'equal' | 'percentage' | 'custom',
      involved_members,
      percentages || undefined,
      custom_shares || undefined,
      notes || undefined,
      category || 'general'
    );

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
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
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const limit = limitParam ? Number(limitParam) : 20;
    const offset = offsetParam ? Number(offsetParam) : 0;

    if (!tripId) {
      return badRequestResponse('Missing required query parameter: tripId');
    }
    if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
      return badRequestResponse('limit must be an integer between 1 and 100');
    }
    if (!Number.isInteger(offset) || offset < 0) {
      return badRequestResponse('offset must be an integer greater than or equal to 0');
    }

    // Check view access
    const { hasAccess, error: roleError } = await checkTripViewAccess(
      auth.user!.userId,
      tripId
    );

    if (!hasAccess) {
      return forbiddenResponse(roleError ?? undefined);
    }

    const { expenses, total, error } = await getTripExpenses(tripId, limit, offset);

    if (error) {
      return serverErrorResponse(error);
    }

    return NextResponse.json(
      {
        expenses, // Backward compatibility
        data: expenses,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + expenses.length < total,
        },
      },
      { status: 200 }
    );
  } catch {
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
    const {
      id,
      trip_id,
      title,
      amount,
      paid_by,
      split_type,
      category,
      notes,
      involved_members,
      percentages,
      custom_shares,
      shares,
    } = body;

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

    const hasAmount = amount !== undefined;
    const parsedAmount = hasAmount ? Number(amount) : undefined;
    if (hasAmount && (parsedAmount === undefined || Number.isNaN(parsedAmount) || parsedAmount <= 0)) {
      return badRequestResponse('amount must be a valid number greater than 0');
    }

    if (involved_members !== undefined) {
      if (!Array.isArray(involved_members) || involved_members.length === 0) {
        return badRequestResponse('involved_members must not be empty');
      }
      if (paid_by && !involved_members.includes(paid_by)) {
        return badRequestResponse('paid_by must be part of involved_members');
      }
    }

    if (split_type && !['equal', 'percentage', 'custom'].includes(split_type)) {
      return badRequestResponse('split_type must be "equal", "percentage", or "custom"');
    }

    const updateData = {
      trip_id,
      ...(title && { title }),
      ...(hasAmount && parsedAmount !== undefined && { amount: parsedAmount }),
      ...(paid_by && { paid_by }),
      ...(split_type && { split_type }),
      ...(category !== undefined && { category }),
      ...(notes !== undefined && { notes }),
      ...(involved_members !== undefined && { involved_members }),
      ...(percentages !== undefined && { percentages }),
      ...(custom_shares !== undefined && { custom_shares }),
      ...(shares && { shares }),
    };

    const { expense, error } = await updateExpense(id, updateData);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ expense }, { status: 200 });
  } catch {
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
  } catch {
    return serverErrorResponse('Failed to delete expense');
  }
}
