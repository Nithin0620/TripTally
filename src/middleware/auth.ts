// ============================================
// Authentication Middleware
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromCookie } from '@/lib/jwt';
import { UserContext } from '@/types';

/**
 * Middleware to verify JWT and attach user context to request
 */
export async function authenticateUser(request: NextRequest) {
  const cookie = request.headers.get('cookie');
  const token = extractTokenFromCookie(cookie ?? undefined);

  if (!token) {
    return {
      authenticated: false,
      user: null,
      error: 'No authentication token provided',
    };
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return {
      authenticated: false,
      user: null,
      error: 'Invalid or expired token',
    };
  }

  const user: UserContext = {
    userId: payload.userId,
    email: payload.email,
  };

  return {
    authenticated: true,
    user,
    error: null,
  };
}

/**
 * Helper to create unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Helper to create forbidden response
 */
export function forbiddenResponse(message: string = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * Helper to create bad request response
 */
export function badRequestResponse(message: string = 'Bad Request') {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Helper to create server error response
 */
export function serverErrorResponse(message: string = 'Internal Server Error') {
  return NextResponse.json({ error: message }, { status: 500 });
}
