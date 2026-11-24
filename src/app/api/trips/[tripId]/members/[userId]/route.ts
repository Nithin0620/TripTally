import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateUser,
  badRequestResponse,
  forbiddenResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from '@/middleware/auth';
import { checkTripOwnership } from '@/middleware/role';
import { removeTripMember, updateTripMemberRole } from '@/services/trip.service';
import { supabaseAdmin } from '@/lib/supabase';
import { TripRole } from '@/types';

const VALID_ROLES: TripRole[] = ['owner', 'editor', 'viewer'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { tripId: string; userId: string } }
) {
  const auth = await authenticateUser(request);
  if (!auth.authenticated || !auth.user) {
    return unauthorizedResponse();
  }

  const access = await checkTripOwnership(auth.user.userId, params.tripId);
  if (!access.hasAccess) {
    return forbiddenResponse(access.error ?? undefined);
  }

  try {
    const body = (await request.json()) as { role?: TripRole };
    if (!body.role || !VALID_ROLES.includes(body.role)) {
      return badRequestResponse('Role must be owner, editor, or viewer');
    }

    const { data: trip, error: tripError } = await supabaseAdmin
      .from('trips')
      .select('created_by')
      .eq('id', params.tripId)
      .single();

    if (tripError || !trip) {
      return badRequestResponse('Trip not found');
    }

    const { data: target, error: targetError } = await supabaseAdmin
      .from('trip_members')
      .select('role')
      .eq('trip_id', params.tripId)
      .eq('user_id', params.userId)
      .single();

    if (targetError || !target) {
      return badRequestResponse('Member not found');
    }

    if (trip.created_by === params.userId && body.role !== 'owner') {
      return badRequestResponse('The trip creator must remain an owner');
    }

    if (target.role === 'owner' && body.role !== 'owner') {
      const { count } = await supabaseAdmin
        .from('trip_members')
        .select('id', { count: 'exact', head: true })
        .eq('trip_id', params.tripId)
        .eq('role', 'owner');

      if ((count ?? 0) <= 1) {
        return badRequestResponse('At least one owner is required');
      }
    }

    const { member, error } = await updateTripMemberRole(
      params.tripId,
      params.userId,
      body.role
    );
    if (error) {
      return serverErrorResponse(error);
    }

    return NextResponse.json({ success: true, member });
  } catch (error) {
    console.error('PATCH /api/trips/[tripId]/members/[userId] error:', error);
    return serverErrorResponse();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { tripId: string; userId: string } }
) {
  const auth = await authenticateUser(request);
  if (!auth.authenticated || !auth.user) {
    return unauthorizedResponse();
  }

  const access = await checkTripOwnership(auth.user.userId, params.tripId);
  if (!access.hasAccess) {
    return forbiddenResponse(access.error ?? undefined);
  }

  try {
    const { data: trip, error: tripError } = await supabaseAdmin
      .from('trips')
      .select('created_by')
      .eq('id', params.tripId)
      .single();

    if (tripError || !trip) {
      return badRequestResponse('Trip not found');
    }

    if (trip.created_by === params.userId) {
      return badRequestResponse('The trip creator cannot be removed');
    }

    const { data: target, error: targetError } = await supabaseAdmin
      .from('trip_members')
      .select('role')
      .eq('trip_id', params.tripId)
      .eq('user_id', params.userId)
      .single();

    if (targetError || !target) {
      return badRequestResponse('Member not found');
    }

    if (target.role === 'owner') {
      const { count } = await supabaseAdmin
        .from('trip_members')
        .select('id', { count: 'exact', head: true })
        .eq('trip_id', params.tripId)
        .eq('role', 'owner');

      if ((count ?? 0) <= 1) {
        return badRequestResponse('At least one owner is required');
      }
    }

    const { error } = await removeTripMember(params.tripId, params.userId);
    if (error) {
      return serverErrorResponse(error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/trips/[tripId]/members/[userId] error:', error);
    return serverErrorResponse();
  }
}
