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
import * as userService from '@/services/userService';

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
 * POST /api/trips/[tripId]/members - Add member (owner only)
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return unauthorizedResponse('Missing or invalid token');
    }

    const userRole = await getUserTripRole(params.tripId, user.id);
    if (userRole !== 'owner') {
      return forbiddenResponse('Only trip owner can add members');
    }

    const { email, role = 'editor' } = await request.json();

    if (!email) {
      return badRequestResponse('Email is required');
    }

    const newUser = await userService.getUserByEmail(email);
    if (!newUser) {
      return badRequestResponse('User with that email not found');
    }

    const member = await tripService.addTripMember(params.tripId, newUser.id, role);
    return successResponse(member, 'Member added successfully', 201);
  } catch (error) {
    console.error('Add trip member error:', error);
    return serverErrorResponse('Failed to add member');
  }
}

/**
 * GET /api/trips/[tripId]/members - Get trip members
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

    const members = await tripService.getTripMembers(params.tripId);
    return successResponse(members);
  } catch (error) {
    console.error('Get trip members error:', error);
    return serverErrorResponse('Failed to fetch members');
  }
}
