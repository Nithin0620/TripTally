// ============================================
// Authentication Middleware
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromCookie } from '@/lib/jwt';
import { UserContext } from '@/types';

type ErrorPayload = {
  error: string;
  code?: string;
  hint?: string;
};

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

export function errorResponse(
  status: number,
  message: string,
  code?: string,
  hint?: string
) {
  const payload: ErrorPayload = { error: message };
  if (code) payload.code = code;
  if (hint) payload.hint = hint;
  return NextResponse.json(payload, { status });
}

/**
 * Helper to create unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return errorResponse(401, message, 'UNAUTHORIZED');
}

/**
 * Helper to create forbidden response
 */
export function forbiddenResponse(message: string = 'Forbidden') {
  return errorResponse(403, message, 'FORBIDDEN');
}

/**
 * Helper to create bad request response
 */
export function badRequestResponse(message: string = 'Bad Request') {
  return errorResponse(400, message, 'BAD_REQUEST');
}

/**
 * Helper to create server error response
 */
export function serverErrorResponse(message: string = 'Internal Server Error') {
  return errorResponse(500, message, 'INTERNAL_SERVER_ERROR');
}
