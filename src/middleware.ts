import { NextRequest, NextResponse } from 'next/server';
import { getClientIpFromHeaders, isRateLimited } from '@/lib/rateLimit';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const ip = getClientIpFromHeaders(request.headers);
  const key = `${path}:${ip}`;
  const result = isRateLimited(key);

  if (result.limited) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        code: 'RATE_LIMITED',
        hint: 'Try again in a minute',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(result.retryAfterSec),
        },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/auth/:path*', '/api/explore/:path*', '/api/trips/invite'],
};
