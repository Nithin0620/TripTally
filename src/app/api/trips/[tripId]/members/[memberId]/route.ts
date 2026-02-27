import { NextRequest } from 'next/server';
import {
  authenticateRequest,
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api-helpers';
import * as tripService from '@/services/tripService';

interface RouteContext {
  params: {
    tripId: string;
    memberId: string;
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
 * PATCH /api/trips/[tripId]/members/[memberId] - Update member role (owner only)
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return unauthorizedResponse('Missing or invalid token');
    }

    const userRole = await getUserTripRole(params.tripId, user.id);
    if (userRole !== 'owner') {
      return forbiddenResponse('Only trip owner can update member roles');
    }

    const { role } = await request.json();

    if (!role || !['owner', 'editor', 'viewer'].includes(role)) {
      return badRequestResponse('Invalid role. Must be: owner, editor, or viewer');
    }

    const member = await tripService.updateMemberRole(params.tripId, params.memberId, role);
    return successResponse(member, 'Member role updated');
  } catch (error) {
    console.error('Update member role error:', error);
    return serverErrorResponse('Failed to update member role');
  }
}

/**
 * DELETE /api/trips/[tripId]/members/[memberId] - Remove member (owner only)
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return unauthorizedResponse('Missing or invalid token');
    }

    const userRole = await getUserTripRole(params.tripId, user.id);
    if (userRole !== 'owner') {
      return forbiddenResponse('Only trip owner can remove members');
    }

    await tripService.removeTripMember(params.tripId, params.memberId);
    return successResponse(null, 'Member removed successfully');
  } catch (error) {
    console.error('Remove trip member error:', error);
    return serverErrorResponse('Failed to remove member');
  }
}
