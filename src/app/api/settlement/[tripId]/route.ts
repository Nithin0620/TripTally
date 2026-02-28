// ============================================
// GET /api/settlement/[tripId] - Calculate settlements
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, serverErrorResponse } from '@/middleware/auth';
import { checkTripViewAccess } from '@/middleware/role';
import { forbiddenResponse } from '@/middleware/auth';
import { calculateTripSettlements } from '@/services/settlement.service';

/**
 * GET /api/settlement/[tripId] - Get settlement calculations
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

    const { settlements, error, balances } = await calculateTripSettlements(tripId);

    if (error) {
      return serverErrorResponse(error);
    }

    return NextResponse.json(
      {
        settlements,
        balances,
        summary: {
          totalSettlements: settlements.length,
          totalAmount: settlements.reduce((sum, s) => sum + s.amount, 0),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error calculating settlements:', error);
    return serverErrorResponse('Failed to calculate settlements');
  }
}
