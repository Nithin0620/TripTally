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
  notifySettlementPayment,
  sendPaymentReminders,
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

    const { settlements, error, balances, payments, totalExpensed, currency, users } =
      await calculateTripSettlements(tripId);

    if (error) {
      return serverErrorResponse(error);
    }

    const completedPayments = (payments || []).filter(payment => payment.status === 'completed');

    return NextResponse.json(
      {
        settlements,
        balances,
        payments: payments || [],
        currency,
        users,
        summary: {
          totalSettlements: settlements.length,
          totalAmount: settlements.reduce((sum, s) => sum + s.amount, 0),
          totalPaid: completedPayments.reduce((sum, payment) => sum + Number(payment.amount), 0),
          totalExpensed,
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
    if (!from_user_id || !to_user_id || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return badRequestResponse('from_user_id, to_user_id, and positive amount are required');
    }

    if (from_user_id === to_user_id) {
      return badRequestResponse('Payer and receiver cannot be the same user');
    }

    const { balances, currency: tripCurrency, error: calculationError } =
      await calculateTripSettlements(tripId);

    if (calculationError) {
      return serverErrorResponse(calculationError);
    }

    if (balances[from_user_id] === undefined || balances[to_user_id] === undefined) {
      return badRequestResponse('Both users must be members of this trip');
    }

    const debtorBalance = balances[from_user_id];
    const creditorBalance = balances[to_user_id];
    if (debtorBalance >= -0.01 || creditorBalance <= 0.01) {
      return badRequestResponse('No outstanding debt exists between these members');
    }

    const outstanding = Math.min(Math.abs(debtorBalance), creditorBalance);
    if (parsedAmount > outstanding + 0.01) {
      return badRequestResponse(`Amount exceeds the outstanding balance of ${outstanding.toFixed(2)}`);
    }

    const { payment, error } = await recordSettlementPayment({
      trip_id: tripId,
      from_user_id,
      to_user_id,
      amount: Number(parsedAmount.toFixed(2)),
      currency: currency || tripCurrency,
      payment_method: payment_method || 'other',
      notes: notes || '',
      status: 'completed',
      created_by: auth.user!.userId,
    });

    if (error || !payment) {
      return serverErrorResponse(error || 'Failed to record payment');
    }

    const notificationResults = await Promise.all([
      notifySettlementPayment(tripId, payment),
      sendPaymentReminders(tripId, { excludeUserIds: [from_user_id] }),
    ]);
    const notificationError = notificationResults.find(result => result.error)?.error;
    if (notificationError) {
      console.warn('Payment recorded but notification failed:', notificationError);
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
