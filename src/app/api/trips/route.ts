import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, successResponse, unauthorizedResponse, badRequestResponse, serverErrorResponse } from '@/lib/api-helpers';
import * as tripService from '@/services/tripService';
import { isValidDateRange } from '@/utils/responses';

/**
 * POST /api/trips - Create a new trip
 * GET /api/trips/my-trips - Get user's trips
 */
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return unauthorizedResponse('Missing or invalid token');
    }

    const { title, description, start_date, end_date, cover_image } = await request.json();

    if (!title || !start_date || !end_date) {
      return badRequestResponse('Missing required fields: title, start_date, end_date');
    }

    if (!isValidDateRange(start_date, end_date)) {
      return badRequestResponse('Invalid date range: start_date must be before end_date');
    }

    const trip = await tripService.createTrip({
      title,
      description,
      start_date,
      end_date,
      cover_image,
      created_by: user.id,
    });

    // Add creator as owner
    await tripService.addTripMember(trip.id, user.id, 'owner');

    return successResponse(trip, 'Trip created successfully', 201);
  } catch (error) {
    console.error('Create trip error:', error);
    return serverErrorResponse('Failed to create trip');
  }
}


