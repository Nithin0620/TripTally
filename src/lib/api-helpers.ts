import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Missing SUPABASE_JWT_SECRET environment variable');
}

const secret = new TextEncoder().encode(JWT_SECRET);

export interface AuthUser {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

/**
 * Authenticate user from JWT token in Authorization header
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix

    try {
      const verified = await jwtVerify(token, secret);
      return {
        id: verified.payload.sub as string,
        email: verified.payload.email as string,
        iat: verified.payload.iat as number,
        exp: verified.payload.exp as number,
      };
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return null;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Forbidden response
 */
export function forbiddenResponse(message: string = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * Bad request response
 */
export function badRequestResponse(message: string = 'Bad request') {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Not found response
 */
export function notFoundResponse(message: string = 'Not found') {
  return NextResponse.json({ error: message }, { status: 404 });
}

/**
 * Server error response
 */
export function serverErrorResponse(message: string = 'Internal server error') {
  return NextResponse.json({ error: message }, { status: 500 });
}

/**
 * Success response
 */
export function successResponse<T>(data: T, message?: string, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}
