// ============================================
// JWT Token Management
// Uses HTTP-only cookies for secure token storage
// ============================================

import { SignJWT, jwtVerify } from 'jose';
import { AppJWTPayload } from '@/types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
);

const JWT_EXPIRY = '7d';

/**
 * Sign a JWT token with user data
 */
export async function signToken(payload: Omit<AppJWTPayload, 'iat' | 'exp'>): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<AppJWTPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as unknown as AppJWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Extract token from cookie header
 */
export function extractTokenFromCookie(cookieHeader?: string): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'auth_token') {
      return decodeURIComponent(value);
    }
  }

  return null;
}

/**
 * Set auth token in httpOnly cookie
 * Secure: Cookie is not accessible via JavaScript (XSS protection)
 */
export function setAuthCookie(token: string): string {
  return `auth_token=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`;
}

/**
 * Clear auth cookie
 */
export function clearAuthCookie(): string {
  return `auth_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

/**
 * Alias for verifyToken for backward compatibility
 */
export const verifyJWT = verifyToken;

/**
 * Client helper to read auth token from cookies in the browser.
 * Returns `null` on server or when token missing.
 */
export async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const cookieHeader = typeof document !== 'undefined' ? document.cookie : '';
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  const authCookie = cookies.find(c => c.startsWith('auth_token='));
  if (!authCookie) return null;

  return decodeURIComponent(authCookie.split('=')[1] || '');
}


