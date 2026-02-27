import { NextRequest } from 'next/server';
import {
  authenticateRequest,
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api-helpers';
import * as activityService from '@/services/activityService';
import * as tripService from '@/services/tripService';

interface RouteContext {
  params: {
    tripId: string;
    activityId: string;
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
 * GET /api/trips/[tripId]/activities/[activityId] - Get activity
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

    const activity = await activityService.getActivityById(params.activityId);
    if (!activity) {
      return notFoundResponse('Activity not found');
    }

    return successResponse(activity);
  } catch (error) {
    console.error('Get activity error:', error);
    return serverErrorResponse('Failed to fetch activity');
  }
}

/**
 * PATCH /api/trips/[tripId]/activities/[activityId] - Update activity (editor/owner only)
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return unauthorizedResponse('Missing or invalid token');
    }

    const userRole = await getUserTripRole(params.tripId, user.id);
    if (!['owner', 'editor'].includes(userRole || '')) {
      return forbiddenResponse('Insufficient permissions to update activities');
    }

    const updates = await request.json();
    const activity = await activityService.updateActivity(params.activityId, updates);

    return successResponse(activity, 'Activity updated');
  } catch (error) {
    console.error('Update activity error:', error);
    return serverErrorResponse('Failed to update activity');
  }
}

/**
 * DELETE /api/trips/[tripId]/activities/[activityId] - Delete activity (editor/owner only)
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return unauthorizedResponse('Missing or invalid token');
    }

    const userRole = await getUserTripRole(params.tripId, user.id);
    if (!['owner', 'editor'].includes(userRole || '')) {
      return forbiddenResponse('Insufficient permissions to delete activities');
    }

    await activityService.deleteActivity(params.activityId);
    return successResponse(null, 'Activity deleted');
  } catch (error) {
    console.error('Delete activity error:', error);
    return serverErrorResponse('Failed to delete activity');
  }
}
