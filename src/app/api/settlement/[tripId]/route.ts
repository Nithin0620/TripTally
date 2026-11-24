// ============================================
// GET /api/settlement/[tripId] - Calculate settlements
// POST /api/settlement/[tripId] - Record a settled payment
// DELETE /api/settlement/[tripId] - Delete a recorded payment
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, badRequestResponse, serverErrorResponse, forbiddenResponse } from '@/middleware/auth';
import { checkTripViewAccess, checkTripEditAccess } from '@/middleware/role';
import {
  calculateTripSettlements,
  recordSettlementPayment,
  deleteSettlementPayment,
} from '@/services/settlement.service';

/**
 * GET /api/settlement/[tripId] - Get settlement calculations & payments
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const auth = await authenticateUser(request);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { tripId } = params;

    // Check view access
    const { hasAccess, error: roleError } = await checkTripViewAccess(
      auth.user!.userId,
      tripId
    );

    if (!hasAccess) {
      return forbiddenResponse(roleError ?? undefined);
    }

    const { settlements, error, balances, payments } = await calculateTripSettlements(tripId);

    if (error) {
      return serverErrorResponse(error);
    }

    return NextResponse.json(
      {
        settlements,
        balances,
        payments: payments || [],
        summary: {
          totalSettlements: settlements.length,
          totalAmount: settlements.reduce((sum, s) => sum + s.amount, 0),
          totalPaid: (payments || []).reduce((sum: number, p: any) => sum + p.amount, 0),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error calculating settlements:', error);
    return serverErrorResponse('Failed to calculate settlements');
  }
}

/**
 * POST /api/settlement/[tripId] - Record a settlement payment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const auth = await authenticateUser(request);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { tripId } = params;

    const { hasAccess, error: roleError } = await checkTripEditAccess(
      auth.user!.userId,
      tripId
    );

    if (!hasAccess) {
      return forbiddenResponse(roleError ?? undefined);
    }

    const body = await request.json();
    const { from_user_id, to_user_id, amount, currency, payment_method, notes } = body;

    const parsedAmount = Number(amount);
    if (!from_user_id || !to_user_id || !parsedAmount || parsedAmount <= 0) {
      return badRequestResponse('from_user_id, to_user_id, and positive amount are required');
    }

    if (from_user_id === to_user_id) {
      return badRequestResponse('Payer and receiver cannot be the same user');
    }

    const { payment, error } = await recordSettlementPayment({
      trip_id: tripId,
      from_user_id,
      to_user_id,
      amount: Number(parsedAmount.toFixed(2)),
      currency: currency || 'INR',
      payment_method: payment_method || 'other',
      notes: notes || '',
      created_by: auth.user!.userId,
    });

    if (error) {
      return serverErrorResponse(error);
    }

    return NextResponse.json({ payment, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error recording settlement payment:', error);
    return serverErrorResponse('Failed to record payment');
  }
}

/**
 * DELETE /api/settlement/[tripId]?paymentId=... - Delete a settlement payment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const auth = await authenticateUser(request);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { tripId } = params;
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return badRequestResponse('paymentId query parameter is required');
    }

    const { hasAccess, error: roleError } = await checkTripEditAccess(
      auth.user!.userId,
      tripId
    );

    if (!hasAccess) {
      return forbiddenResponse(roleError ?? undefined);
    }

    const { error } = await deleteSettlementPayment(tripId, paymentId);

    if (error) {
      return serverErrorResponse(error);
    }

    return NextResponse.json({ message: 'Payment deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return serverErrorResponse('Failed to delete payment');
  }
}
