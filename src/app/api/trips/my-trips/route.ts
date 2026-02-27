import { NextRequest } from 'next/server';
import { authenticateRequest, successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-helpers';
import * as tripService from '@/services/tripService';

/**
 * GET /api/trips/my-trips - Get user's trips
 */
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return unauthorizedResponse('Missing or invalid token');
    }

    const trips = await tripService.getUserTrips(user.id);
    return successResponse(trips);
  } catch (error) {
    console.error('Get user trips error:', error);
    return serverErrorResponse('Failed to fetch trips');
  }
}
