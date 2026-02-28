// ============================================
// GET /api/trips/[tripId] - Get trip details
// PUT /api/trips/[tripId] - Update trip
// DELETE /api/trips/[tripId] - Delete trip
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, badRequestResponse, serverErrorResponse } from '@/middleware/auth';
import {
  checkTripViewAccess,
  checkTripOwnership,
} from '@/middleware/role';
import {
  getTrip,
  updateTrip,
  deleteTrip,
} from '@/services/trip.service';
import { forbiddenResponse } from '@/middleware/auth';

/**
 * GET /api/trips/[tripId] - Get trip details
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

    // Check access
    const { hasAccess, error: roleError } = await checkTripViewAccess(
      auth.user!.userId,
      tripId
    );

    if (!hasAccess) {
      return forbiddenResponse(roleError);
    }

    const { trip, members, error } = await getTrip(tripId);

    if (error) {
      return serverErrorResponse(error);
    }

    return NextResponse.json({ trip, members }, { status: 200 });
  } catch (error) {
    console.error('Error fetching trip:', error);
    return serverErrorResponse('Failed to fetch trip');
  }
}

/**
 * PUT /api/trips/[tripId] - Update trip
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const auth = await authenticateUser(request);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { tripId } = params;

    // Check ownership (only owner can update trip)
    const { hasAccess, error: roleError } = await checkTripOwnership(
      auth.user!.userId,
      tripId
    );

    if (!hasAccess) {
      return forbiddenResponse(roleError);
    }

    const body = await request.json();
    const { title, description, start_date, end_date, cover_image } = body;

    const updateData = {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(start_date && { start_date }),
      ...(end_date && { end_date }),
      ...(cover_image !== undefined && { cover_image }),
    };

    const { trip, error } = await updateTrip(tripId, updateData);

    if (error) {
      return serverErrorResponse(error);
    }

    return NextResponse.json({ trip }, { status: 200 });
  } catch (error) {
    console.error('Error updating trip:', error);
    return serverErrorResponse('Failed to update trip');
  }
}

/**
 * DELETE /api/trips/[tripId] - Delete trip
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

    // Check ownership (only owner can delete trip)
    const { hasAccess, error: roleError } = await checkTripOwnership(
      auth.user!.userId,
      tripId
    );

    if (!hasAccess) {
      return forbiddenResponse(roleError);
    }

    const { error } = await deleteTrip(tripId);

    if (error) {
      return serverErrorResponse(error);
    }

    return NextResponse.json({ message: 'Trip deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting trip:', error);
    return serverErrorResponse('Failed to delete trip');
  }
}
