import { NextRequest } from 'next/server';
import {
  authenticateRequest,
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api-helpers';
import * as activityService from '@/services/activityService';
import * as tripService from '@/services/tripService';

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
 * POST /api/trips/[tripId]/activities - Create activity (editor/owner only)
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return unauthorizedResponse('Missing or invalid token');
    }

    const userRole = await getUserTripRole(params.tripId, user.id);
    if (!['owner', 'editor'].includes(userRole || '')) {
      return forbiddenResponse('Insufficient permissions to create activities');
    }

    const { title, activity_date, location, latitude, longitude, notes, order_index } = await request.json();

    if (!title || !activity_date) {
      return badRequestResponse('Missing required fields: title, activity_date');
    }

    const activity = await activityService.createActivity({
      trip_id: params.tripId,
      title,
      activity_date,
      location,
      latitude,
      longitude,
      notes,
      order_index,
    });

    return successResponse(activity, 'Activity created', 201);
  } catch (error) {
    console.error('Create activity error:', error);
    return serverErrorResponse('Failed to create activity');
  }
}

/**
 * GET /api/trips/[tripId]/activities - Get all activities for trip
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return unauthorizedResponse('Missing or invalid token');
    }

    const userRole = await getUserTripRole(params.tripId, user.id);
    if (!userRole) {
      return forbiddenResponse('You do not have access to this trip');
    }

    const activities = await activityService.getTripActivities(params.tripId);
    return successResponse(activities);
  } catch (error) {
    console.error('Get trip activities error:', error);
    return serverErrorResponse('Failed to fetch activities');
  }
}
