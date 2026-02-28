// ============================================
// GET /api/trips - List user's trips
// POST /api/trips - Create new trip
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, badRequestResponse, serverErrorResponse } from '@/middleware/auth';
import { getUserTrips } from '@/middleware/role';
import { createTrip } from '@/services/trip.service';
import { CreateTripRequest } from '@/types';

/**
 * GET /api/trips - List user trips
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateUser(request);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { trips, error } = await getUserTrips(auth.user!.userId);

    if (error) {
      return serverErrorResponse(error);
    }

    return NextResponse.json({ trips }, { status: 200 });
  } catch (error) {
    console.error('Error fetching trips:', error);
    return serverErrorResponse('Failed to fetch trips');
  }
}

/**
 * POST /api/trips - Create trip
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateUser(request);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, start_date, end_date, cover_image } = body;

    // Validation
    if (!title || !start_date || !end_date) {
      return badRequestResponse('Missing required fields: title, start_date, end_date');
    }

    const tripData: CreateTripRequest = {
      title,
      description,
      start_date,
      end_date,
      cover_image,
    };

    const { trip, error } = await createTrip(auth.user!.userId, tripData);

    if (error) {
      return serverErrorResponse(error);
    }

    return NextResponse.json({ trip }, { status: 201 });
  } catch (error) {
    console.error('Error creating trip:', error);
    return serverErrorResponse('Failed to create trip');
  }
}
