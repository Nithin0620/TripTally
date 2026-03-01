// ============================================
// JWT Token Management
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
 * Get auth token from localStorage (client-side)
 * Falls back to auth context if available
 */
export async function getAuthToken(): Promise<string | null> {
  // Try localStorage first
  if (typeof window !== 'undefined' && window.localStorage) {
    const token = window.localStorage.getItem('auth_token');
    if (token) return token;
  }

  // Try to get from auth context via a fetch to get session
  try {
    const response = await fetch('/api/auth/session', { method: 'GET' });
    if (response.ok) {
      const data = await response.json();
      return data.token || null;
    }
  } catch (error) {
    console.error('Failed to get auth token:', error);
  }

  return null;
}

/**
 * Store auth token in localStorage (client-side)
 */
export function storeAuthToken(token: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem('auth_token', token);
  }
}

/**
 * Remove auth token from localStorage (client-side)
 */
export function removeAuthToken(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('auth_token');
  }
}

/**
 * Alias for verifyToken for backward compatibility
 */
export const verifyJWT = verifyToken;

