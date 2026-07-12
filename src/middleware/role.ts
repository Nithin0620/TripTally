// ============================================
// Role-Based Access Control Middleware
// ============================================

import { supabaseAdmin } from '@/lib/supabase';
import { forbiddenResponse } from './auth';

type TripRole = 'owner' | 'editor' | 'viewer';

const rolePermissions: Record<TripRole, TripRole[]> = {
  owner: ['owner'],
  editor: ['owner', 'editor'],
  viewer: ['owner', 'editor', 'viewer'],
};

/**
 * Check if user has required role on trip
 */
export async function checkTripRole(
  userId: string,
  tripId: string,
  requiredRole: TripRole
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return { hasAccess: false, role: null, error: 'Not a trip member' };
    }

    const userRole = data.role as TripRole;
    const hasAccess = rolePermissions[requiredRole].includes(userRole);

    return {
      hasAccess,
      role: userRole,
      error: hasAccess ? null : 'Insufficient permissions for this action',
    };
  } catch (error) {
    console.error('Error checking trip role:', error);
    return { hasAccess: false, role: null, error: 'Failed to verify permissions' };
  }
}

/**
 * Verify user is trip owner
 */
export async function checkTripOwnership(userId: string, tripId: string) {
  return checkTripRole(userId, tripId, 'owner');
}

/**
 * Verify user can edit trip content (owner or editor)
 */
export async function checkTripEditAccess(userId: string, tripId: string) {
  return checkTripRole(userId, tripId, 'editor');
}

/**
 * Verify user can view trip (any role)
 */
export async function checkTripViewAccess(userId: string, tripId: string) {
  return checkTripRole(userId, tripId, 'viewer');
}

/**
 * Middleware function to require specific trip role
 */
export async function requireTripRole(
  userId: string,
  tripId: string,
  requiredRole: TripRole
) {
  const { hasAccess, error } = await checkTripRole(userId, tripId, requiredRole);

  if (!hasAccess) {
    return forbiddenResponse(error || 'Insufficient permissions');
  }

  return null; // No error, access granted
}

/**
 * Get all trips for user
 */
export async function getUserTrips(userId: string, limit?: number, offset?: number) {
  try {
    const resolvedLimit = typeof limit === 'number' ? limit : 20;
    const resolvedOffset = typeof offset === 'number' ? offset : 0;
    const from = Math.max(0, resolvedOffset);
    const to = from + Math.max(1, resolvedLimit) - 1;

    const { data, error, count } = await supabaseAdmin
      .from('trip_members')
      .select('trip_id, role, trips(id, title, description, start_date, end_date, cover_image, created_by)', {
        count: 'exact',
      })
      .eq('user_id', userId)
      .range(from, to);

    if (error) throw error;

    return { trips: data || [], total: count || 0, error: null };
  } catch {
    return { trips: [], total: 0, error: 'Failed to fetch trips' };
  }
}
