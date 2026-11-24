import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, forbiddenResponse, serverErrorResponse, unauthorizedResponse } from '@/middleware/auth';
import { checkTripViewAccess } from '@/middleware/role';
import { getTrip } from '@/services/trip.service';

export async function GET(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  const auth = await authenticateUser(request);
  if (!auth.authenticated || !auth.user) {
    return unauthorizedResponse();
  }

  const access = await checkTripViewAccess(auth.user.userId, params.tripId);
  if (!access.hasAccess) {
    return forbiddenResponse(access.error ?? undefined);
  }

  const { members, error } = await getTrip(params.tripId);
  if (error) {
    return serverErrorResponse(error);
  }

  return NextResponse.json({ success: true, members });
}
