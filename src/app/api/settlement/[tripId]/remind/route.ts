import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, serverErrorResponse, forbiddenResponse } from '@/middleware/auth';
import { checkTripEditAccess } from '@/middleware/role';
import { sendPaymentReminders } from '@/services/settlement.service';

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

    const { count, error } = await sendPaymentReminders(tripId);
    if (error) {
      return serverErrorResponse(error);
    }

    return NextResponse.json({ count, success: true }, { status: 200 });
  } catch (error) {
    console.error('Error sending payment reminders:', error);
    return serverErrorResponse('Failed to send payment reminders');
  }
}
