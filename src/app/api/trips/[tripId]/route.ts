import { NextRequest } from 'next/server';
import {
  authenticateRequest,
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
  badRequestResponse,
} from '@/lib/api-helpers';
import * as tripService from '@/services/tripService';
import { isValidDateRange } from '@/utils/responses';

interface RouteContext {
  params: {
    tripId: string;
  };
}

/**
 * Get user's role for a trip
 */
async function getUserTripRole(tripId: string, userId: string): Promise<string | null> {
  const members = await tripService.getTripMembers(tripId);
  const member = members.find((m: any) => m.user_id === userId);
  return member?.role || null;
}

/**
 * GET /api/trips/[tripId] - Get trip details
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return unauthorizedResponse('Missing or invalid token');
    }

    const trip = await tripService.getTripWithMembers(params.tripId);
    if (!trip) {
      return notFoundResponse('Trip not found');
    }

    // Check if user has access to this trip
    const userRole = await getUserTripRole(params.tripId, user.id);
    if (!userRole) {
      return forbiddenResponse('You do not have access to this trip');
    }

    return successResponse(trip);
  } catch (error) {
    console.error('Get trip error:', error);
    return serverErrorResponse('Failed to fetch trip');
  }
}

/**
 * PATCH /api/trips/[tripId] - Update trip (owner only)
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return unauthorizedResponse('Missing or invalid token');
    }

    const userRole = await getUserTripRole(params.tripId, user.id);
    if (userRole !== 'owner') {
      return forbiddenResponse('Only trip owner can update trip');
    }

    const { title, description, cover_image, start_date, end_date } = await request.json();

    if (start_date && end_date && !isValidDateRange(start_date, end_date)) {
      return badRequestResponse('Invalid date range');
    }

    const trip = await tripService.updateTrip(params.tripId, {
      title,
      description,
      cover_image,
      start_date,
      end_date,
    });

    return successResponse(trip, 'Trip updated successfully');
  } catch (error) {
    console.error('Update trip error:', error);
    return serverErrorResponse('Failed to update trip');
  }
}

/**
 * DELETE /api/trips/[tripId] - Delete trip (owner only)
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return unauthorizedResponse('Missing or invalid token');
    }

    const userRole = await getUserTripRole(params.tripId, user.id);
    if (userRole !== 'owner') {
      return forbiddenResponse('Only trip owner can delete trip');
    }

    await tripService.deleteTrip(params.tripId);
    return successResponse(null, 'Trip deleted successfully');
  } catch (error) {
    console.error('Delete trip error:', error);
    return serverErrorResponse('Failed to delete trip');
  }
}
