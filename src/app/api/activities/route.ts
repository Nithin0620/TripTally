// ============================================
// POST /api/activities - Create activity
// PUT /api/activities - Update activity
// DELETE /api/activities - Delete activity
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, badRequestResponse, serverErrorResponse } from '@/middleware/auth';
import { checkTripEditAccess } from '@/middleware/role';
import { forbiddenResponse } from '@/middleware/auth';
import {
  createActivity,
  updateActivity,
  deleteActivity,
} from '@/services/activity.service';
import { CreateActivityRequest } from '@/types';

/**
 * POST /api/activities - Create activity
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateUser(request);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const {
      trip_id,
      title,
      activity_date,
      location,
      latitude,
      longitude,
      notes,
      order_index,
    } = body;

    // Validation
    if (!trip_id || !title || !activity_date) {
      return badRequestResponse('Missing required fields: trip_id, title, activity_date');
    }

    // Check edit access
    const { hasAccess, error: roleError } = await checkTripEditAccess(
      auth.user!.userId,
      trip_id
    );

    if (!hasAccess) {
      return forbiddenResponse(roleError);
    }

    const activityData: CreateActivityRequest = {
      trip_id,
      title,
      activity_date,
      location,
      latitude,
      longitude,
      notes,
      order_index,
    };

    const { activity, error } = await createActivity(activityData);

    if (error) {
      return serverErrorResponse(error);
    }

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return serverErrorResponse('Failed to create activity');
  }
}

/**
 * PUT /api/activities - Update activity
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateUser(request);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      trip_id,
      title,
      activity_date,
      location,
      latitude,
      longitude,
      notes,
      order_index,
    } = body;

    // Validation
    if (!id || !trip_id) {
      return badRequestResponse('Missing required fields: id, trip_id');
    }

    // Check edit access
    const { hasAccess, error: roleError } = await checkTripEditAccess(
      auth.user!.userId,
      trip_id
    );

    if (!hasAccess) {
      return forbiddenResponse(roleError);
    }

    const updateData = {
      trip_id,
      ...(title && { title }),
      ...(activity_date && { activity_date }),
      ...(location !== undefined && { location }),
      ...(latitude !== undefined && { latitude }),
      ...(longitude !== undefined && { longitude }),
      ...(notes !== undefined && { notes }),
      ...(order_index !== undefined && { order_index }),
    };

    const { activity, error } = await updateActivity(id, updateData);

    if (error) {
      return serverErrorResponse(error);
    }

    return NextResponse.json({ activity }, { status: 200 });
  } catch (error) {
    console.error('Error updating activity:', error);
    return serverErrorResponse('Failed to update activity');
  }
}

/**
 * DELETE /api/activities - Delete activity
 */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateUser(request);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { id, trip_id } = body;

    // Validation
    if (!id || !trip_id) {
      return badRequestResponse('Missing required fields: id, trip_id');
    }

    // Check edit access
    const { hasAccess, error: roleError } = await checkTripEditAccess(
      auth.user!.userId,
      trip_id
    );

    if (!hasAccess) {
      return forbiddenResponse(roleError);
    }

    const { error } = await deleteActivity(id);

    if (error) {
      return serverErrorResponse(error);
    }

    return NextResponse.json({ message: 'Activity deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return serverErrorResponse('Failed to delete activity');
  }
}
