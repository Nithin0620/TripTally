// ============================================
// Notification Service
// ============================================

import { supabaseAdmin } from '@/lib/supabase';
import { Notification } from '@/types';

/**
 * Create a notification for a user
 */
export async function createNotification(
  userId: string,
  notification: Omit<Notification, 'id' | 'created_at' | 'read' | 'user_id'>
): Promise<{ notification: Notification | null; error: string | null }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        trip_id: notification.trip_id || null,
        data: notification.data || {},
      })
      .select()
      .single();

    if (error) {
      return { notification: null, error: error.message };
    }

    return { notification: data, error: null };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { notification: null, error: 'Failed to create notification' };
  }
}

/**
 * Create notifications for multiple users
 */
export async function createNotificationsForUsers(
  userIds: string[],
  notification: Omit<Notification, 'id' | 'created_at' | 'read' | 'user_id'>
): Promise<{ count: number; error: string | null }> {
  try {
    const notifications = userIds.map((userId) => ({
      user_id: userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      trip_id: notification.trip_id || null,
      data: notification.data || {},
    }));

    const { error, count } = await supabaseAdmin
      .from('notifications')
      .insert(notifications);

    if (error) {
      return { count: 0, error: error.message };
    }

    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Error creating notifications:', error);
    return { count: 0, error: 'Failed to create notifications' };
  }
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications(
  userId: string,
  options?: { limit?: number; unreadOnly?: boolean; tripId?: string }
): Promise<{ notifications: Notification[]; unreadCount: number; error: string | null }> {
  try {
    let query = supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.tripId) {
      query = query.eq('trip_id', options.tripId);
    }

    if (options?.unreadOnly) {
      query = query.eq('read', false);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data: notifications, error } = await query;

    if (error) {
      return { notifications: [], unreadCount: 0, error: error.message };
    }

    let unreadQuery = supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (options?.tripId) {
      unreadQuery = unreadQuery.eq('trip_id', options.tripId);
    }

    const { count: unreadCount } = await unreadQuery;

    return {
      notifications: notifications || [],
      unreadCount: unreadCount || 0,
      error: null,
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { notifications: [], unreadCount: 0, error: 'Failed to fetch notifications' };
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(
  notificationId: string,
  userId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { error: 'Failed to mark notification as read' };
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(
  userId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { error: 'Failed to mark all notifications as read' };
  }
}

/**
 * Delete old notifications (older than 30 days)
 */
export async function cleanupOldNotifications(): Promise<{ deleted: number; error: string | null }> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { error, count } = await supabaseAdmin
      .from('notifications')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString());

    if (error) {
      return { deleted: 0, error: error.message };
    }

    return { deleted: count || 0, error: null };
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
    return { deleted: 0, error: 'Failed to cleanup notifications' };
  }
}
