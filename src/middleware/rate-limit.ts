import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store for rate limiting (for single-instance deployment)
// For production with multiple instances, use Redis instead
const rateLimitStore: RateLimitStore = {};

/**
 * Simple in-memory rate limiting middleware
 * For production with multiple instances, replace with Redis-based limiting
 */
export function createRateLimiter(config: RateLimitConfig) {
  const { windowMs, maxRequests, message = 'Too many requests, please try again later.' } = config;

  return function rateLimitMiddleware(request: NextRequest) {
    // Get client identifier (IP address or user ID)
    const clientId = getClientId(request);

    const now = Date.now();
    const rateLimitData = rateLimitStore[clientId];

    // Initialize or reset if window expired
    if (!rateLimitData || rateLimitData.resetTime < now) {
      rateLimitStore[clientId] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return null; // Request allowed
    }

    // Increment counter
    rateLimitData.count++;

    // Check if limit exceeded
    if (rateLimitData.count > maxRequests) {
      const retryAfter = Math.ceil((rateLimitData.resetTime - now) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: message,
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': Math.max(0, maxRequests - rateLimitData.count).toString(),
            'X-RateLimit-Reset': new Date(rateLimitData.resetTime).toISOString(),
          },
        }
      );
    }

    return null; // Request allowed
  };
}

/**
 * Extract client identifier from request
 * Priority: User ID -> IP address -> User-Agent
 */
function getClientId(request: NextRequest): string {
  // Try to use user ID from headers (if authenticated)
  const userId = request.headers.get('x-user-id');
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(', ')[0] : request.ip || 'unknown';

  return `ip:${ip}`;
}

/**
 * Cleanup old entries from rate limit store (call periodically)
 * Prevents memory leaks in long-running processes
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, data] of Object.entries(rateLimitStore)) {
    if (data.resetTime < now) {
      delete rateLimitStore[key];
    }
  }
}

// Optional: Run cleanup every 1 hour
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 60 * 60 * 1000);
}
