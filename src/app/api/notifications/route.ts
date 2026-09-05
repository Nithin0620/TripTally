import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, unauthorizedResponse, serverErrorResponse } from '@/middleware/auth';
import { getUserNotifications, markNotificationRead, markAllNotificationsRead } from '@/services/notification.service';

export async function GET(request: NextRequest) {
  const auth = await authenticateUser(request);
  if (!auth.authenticated || !auth.user) {
    return unauthorizedResponse();
  }

  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 20;
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';

    const { notifications, unreadCount, error } = await getUserNotifications(auth.user.userId, {
      limit,
      unreadOnly,
    });

    if (error) {
      return serverErrorResponse(error);
    }

    return NextResponse.json({ notifications, unreadCount, success: true });
  } catch (error) {
    console.error('GET /api/notifications error:', error);
    return serverErrorResponse();
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await authenticateUser(request);
  if (!auth.authenticated || !auth.user) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      const { error } = await markAllNotificationsRead(auth.user.userId);
      if (error) {
        return serverErrorResponse(error);
      }
      return NextResponse.json({ success: true });
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: 'notificationId is required' },
        { status: 400 }
      );
    }

    const { error } = await markNotificationRead(notificationId, auth.user.userId);
    if (error) {
      return serverErrorResponse(error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/notifications error:', error);
    return serverErrorResponse();
  }
}
