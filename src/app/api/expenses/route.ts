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

function parseShareCounts(value: unknown): Record<string, number> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const parsed: Record<string, number> = {};
  for (const [userId, count] of Object.entries(value)) {
    if (typeof count !== 'number' || !Number.isFinite(count) || count < 0) return null;
    parsed[userId] = count;
  }
  return parsed;
}

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
      share_counts,
      notes,
      category,
      expense_date,
      description,
      tags,
      currency,
      exchange_rate,
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
    if (!['equal', 'percentage', 'custom', 'shares'].includes(split_type)) {
      return badRequestResponse('split_type must be "equal", "percentage", "custom", or "shares"');
    }

    const parsedShareCounts = parseShareCounts(share_counts);
    if (share_counts !== undefined && !parsedShareCounts) {
      return badRequestResponse('share_counts must map member IDs to non-negative numbers');
    }

    if (expense_date && Number.isNaN(new Date(expense_date).getTime())) {
      return badRequestResponse('expense_date must be a valid date');
    }

    if (description !== undefined && typeof description !== 'string') {
      return badRequestResponse('description must be a string');
    }

    if (currency !== undefined && typeof currency !== 'string') {
      return badRequestResponse('currency must be a string');
    }

    if (tags !== undefined && !Array.isArray(tags)) {
      return badRequestResponse('tags must be an array of strings');
    }

    const parsedExchangeRate = exchange_rate === undefined ? undefined : Number(exchange_rate);
    if (parsedExchangeRate !== undefined && (Number.isNaN(parsedExchangeRate) || parsedExchangeRate <= 0)) {
      return badRequestResponse('exchange_rate must be a positive number');
    }

    const parsedTags = Array.isArray(tags)
      ? tags.filter((tag: unknown) => typeof tag === 'string' && tag.trim().length > 0).map((tag: string) => tag.trim())
      : undefined;

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
      split_type as 'equal' | 'percentage' | 'custom' | 'shares',
      involved_members,
      percentages || undefined,
      custom_shares || undefined,
      parsedShareCounts || undefined,
      notes || undefined,
      category || 'general',
      expense_date || undefined,
      description || undefined,
      parsedTags,
      currency || undefined,
      parsedExchangeRate
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
      expense_date,
      description,
      tags,
      currency,
      exchange_rate,
      involved_members,
      percentages,
      custom_shares,
      share_counts,
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

    if (expense_date && Number.isNaN(new Date(expense_date).getTime())) {
      return badRequestResponse('expense_date must be a valid date');
    }

    if (description !== undefined && typeof description !== 'string') {
      return badRequestResponse('description must be a string');
    }

    if (currency !== undefined && typeof currency !== 'string') {
      return badRequestResponse('currency must be a string');
    }

    if (tags !== undefined && !Array.isArray(tags)) {
      return badRequestResponse('tags must be an array of strings');
    }

    const parsedExchangeRate = exchange_rate === undefined ? undefined : Number(exchange_rate);
    if (parsedExchangeRate !== undefined && (Number.isNaN(parsedExchangeRate) || parsedExchangeRate <= 0)) {
      return badRequestResponse('exchange_rate must be a positive number');
    }

    const parsedTags = Array.isArray(tags)
      ? tags.filter((tag: unknown) => typeof tag === 'string' && tag.trim().length > 0).map((tag: string) => tag.trim())
      : undefined;

    if (involved_members !== undefined) {
      if (!Array.isArray(involved_members) || involved_members.length === 0) {
        return badRequestResponse('involved_members must not be empty');
      }
      if (paid_by && !involved_members.includes(paid_by)) {
        return badRequestResponse('paid_by must be part of involved_members');
      }
    }

    if (split_type && !['equal', 'percentage', 'custom', 'shares'].includes(split_type)) {
      return badRequestResponse('split_type must be "equal", "percentage", "custom", or "shares"');
    }

    const parsedUpdateShareCounts = parseShareCounts(share_counts);
    if (share_counts !== undefined && !parsedUpdateShareCounts) {
      return badRequestResponse('share_counts must map member IDs to non-negative numbers');
    }

    const updateData = {
      trip_id,
      ...(title && { title }),
      ...(hasAmount && parsedAmount !== undefined && { amount: parsedAmount }),
      ...(paid_by && { paid_by }),
      ...(split_type && { split_type }),
      ...(category !== undefined && { category }),
      ...(notes !== undefined && { notes }),
      ...(expense_date !== undefined && { expense_date }),
      ...(description !== undefined && { description }),
      ...(parsedTags !== undefined && { tags: parsedTags }),
      ...(currency !== undefined && { currency }),
      ...(parsedExchangeRate !== undefined && { exchange_rate: parsedExchangeRate }),
      ...(involved_members !== undefined && { involved_members }),
      ...(percentages !== undefined && { percentages }),
      ...(custom_shares !== undefined && { custom_shares }),
      ...(parsedUpdateShareCounts && { share_counts: parsedUpdateShareCounts }),
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

    const { error } = await deleteExpense(id, trip_id);

    if (error) {
      return serverErrorResponse(error);
    }

    return NextResponse.json({ message: 'Expense deleted successfully' }, { status: 200 });
  } catch {
    return serverErrorResponse('Failed to delete expense');
  }
}
