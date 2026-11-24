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

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const limit = limitParam ? Number(limitParam) : 20;
    const offset = offsetParam ? Number(offsetParam) : 0;
    if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
      return badRequestResponse('limit must be an integer between 1 and 100');
    }
    if (!Number.isInteger(offset) || offset < 0) {
      return badRequestResponse('offset must be an integer greater than or equal to 0');
    }

    const { trips, total, error } = await getUserTrips(auth.user!.userId, limit, offset);

    if (error) {
      return serverErrorResponse(error);
    }

    return NextResponse.json(
      {
        trips, // Backward compatibility
        data: trips,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + trips.length < total,
        },
      },
      { status: 200 }
    );
  } catch {
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
    const { title, destination, description, start_date, end_date, cover_image, currency, budget_limit } = body;

    // Validation
    if (!title || !start_date || !end_date) {
      return badRequestResponse('Missing required fields: title, start_date, end_date');
    }

    if (destination !== undefined && typeof destination !== 'string') {
      return badRequestResponse('destination must be a string');
    }

    const startTime = new Date(start_date).getTime();
    const endTime = new Date(end_date).getTime();
    if (Number.isNaN(startTime) || Number.isNaN(endTime) || startTime > endTime) {
      return badRequestResponse('start_date and end_date must be valid dates with start_date on or before end_date');
    }

    const tripData: CreateTripRequest = {
      title,
      destination,
      description,
      start_date,
      end_date,
      cover_image,
      currency: currency || 'INR',
      budget_limit,
    };

    const { trip, error } = await createTrip(auth.user!.userId, tripData);

    if (error) {
      return serverErrorResponse(error);
    }

    return NextResponse.json({ trip }, { status: 201 });
  } catch {
    return serverErrorResponse('Failed to create trip');
  }
}
